import { Connection, PublicKey } from "@solana/web3.js";
import type {
  SafetyScanResult,
  SafetyCheck,
  TopHolder,
  SafetyScanResponse,
} from "@/types/safety";
import { KNOWN_ADDRESSES } from "@/types/safety";

// ============================================================
// INDEPENDENT ON-CHAIN SAFETY SCANNER
//
// Queries the Solana blockchain directly to analyze token safety.
// No reliance on third-party APIs for safety scoring.
//
// Checks performed:
// 1. Mint authority — can more tokens be created?
// 2. Freeze authority — can accounts be frozen?
// 3. Top holder concentration — is supply distributed?
// 4. LP presence — is there real liquidity?
// 5. LP burn status — is liquidity locked/burned?
// 6. Token metadata mutability — can the token be changed?
// 7. Supply analysis — reasonable total supply?
// ============================================================

const RPC_ENDPOINT =
  process.env.SOLANA_RPC_URL ||
  process.env.HELIUS_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Known burn/null addresses
const BURN_ADDRESSES = new Set([
  "1nc1nerator11111111111111111111111111111111",
  "11111111111111111111111111111111",
]);

// Known DEX pool program IDs
const DEX_PROGRAMS: Record<string, string> = {
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM",
  "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1": "Raydium LP",
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: "Orca Whirlpool",
  CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK: "Raydium CLMM",
  LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo: "Meteora DLMM",
};

// In-memory scan cache (5 minute TTL)
const scanCache = new Map<
  string,
  { result: SafetyScanResult; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000;

function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, {
    commitment: "confirmed",
  });
}

/**
 * Check 1: Mint & Freeze Authority
 * Queries the on-chain mint account to check if authorities are still active.
 */
async function checkAuthorities(
  connection: Connection,
  mintPubkey: PublicKey
): Promise<{
  mintAuthority: { exists: boolean; address: string | null };
  freezeAuthority: { exists: boolean; address: string | null };
  supply: { total: number; decimals: number };
  tokenProgram: "spl-token" | "token-2022";
}> {
  // Try standard SPL Token first
  const accountInfo = await connection.getAccountInfo(mintPubkey);

  if (!accountInfo) {
    throw new Error("Token mint not found on-chain");
  }

  const isToken2022 = accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID);

  // Parse mint account data (layout is the same for first 82 bytes)
  // Mint layout: [4 bytes COption<Pubkey> mintAuthority] [8 bytes supply] [1 byte decimals] [1 byte isInitialized] [4 bytes COption<Pubkey> freezeAuthority]
  const data = accountInfo.data;

  // Mint authority (bytes 0-35): COption (4 bytes) + Pubkey (32 bytes)
  const mintAuthOption = data.readUInt32LE(0);
  const mintAuthorityExists = mintAuthOption === 1;
  const mintAuthorityAddress = mintAuthorityExists
    ? new PublicKey(data.subarray(4, 36)).toBase58()
    : null;

  // Supply (bytes 36-43): u64
  const supplyLow = data.readUInt32LE(36);
  const supplyHigh = data.readUInt32LE(40);
  const supply = supplyHigh * 2 ** 32 + supplyLow;

  // Decimals (byte 44): u8
  const decimals = data.readUInt8(44);

  // Freeze authority (bytes 46-81): COption (4 bytes) + Pubkey (32 bytes)
  const freezeAuthOption = data.readUInt32LE(46);
  const freezeAuthorityExists = freezeAuthOption === 1;
  const freezeAuthorityAddress = freezeAuthorityExists
    ? new PublicKey(data.subarray(50, 82)).toBase58()
    : null;

  return {
    mintAuthority: {
      exists: mintAuthorityExists,
      address: mintAuthorityAddress,
    },
    freezeAuthority: {
      exists: freezeAuthorityExists,
      address: freezeAuthorityAddress,
    },
    supply: {
      total: supply / 10 ** decimals,
      decimals,
    },
    tokenProgram: isToken2022 ? "token-2022" : "spl-token",
  };
}

/**
 * Check 2: Top Holder Concentration
 * Uses getTokenLargestAccounts to find whale wallets.
 */
async function checkHolderConcentration(
  connection: Connection,
  mintPubkey: PublicKey,
  totalSupply: number,
  decimals: number
): Promise<{
  topHolders: TopHolder[];
  top10Pct: number;
  top20Pct: number;
  concentration: "distributed" | "moderate" | "concentrated" | "whale-dominated";
}> {
  const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);

  const topHolders: TopHolder[] = largestAccounts.value
    .slice(0, 20)
    .map((account) => {
      const balance = Number(account.uiAmount ?? 0);
      const pct =
        totalSupply > 0 ? (balance / totalSupply) * 100 : 0;
      const address = account.address.toBase58();
      const label =
        KNOWN_ADDRESSES[address] || DEX_PROGRAMS[address] || undefined;

      return { address, balance, pct, label };
    });

  // Calculate concentration (exclude known LP/burn addresses)
  const nonLpHolders = topHolders.filter(
    (h) =>
      !h.label?.includes("LP") &&
      !h.label?.includes("Burn") &&
      !h.label?.includes("Pool") &&
      !BURN_ADDRESSES.has(h.address)
  );

  const top10Pct = nonLpHolders
    .slice(0, 10)
    .reduce((sum, h) => sum + h.pct, 0);
  const top20Pct = nonLpHolders
    .slice(0, 20)
    .reduce((sum, h) => sum + h.pct, 0);

  let concentration: TopHolder["label"] extends string
    ? "distributed" | "moderate" | "concentrated" | "whale-dominated"
    : never;

  if (top10Pct > 80) concentration = "whale-dominated";
  else if (top10Pct > 50) concentration = "concentrated";
  else if (top10Pct > 25) concentration = "moderate";
  else concentration = "distributed";

  return { topHolders, top10Pct, top20Pct, concentration };
}

/**
 * Check 3: Liquidity Analysis
 * Checks if top holders include known DEX LP programs.
 */
function analyzeLiquidity(topHolders: TopHolder[]): {
  hasLiquidity: boolean;
  estimatedUsd: number;
  lpBurned: boolean;
  dexPools: string[];
} {
  const dexPools: string[] = [];
  let lpBurned = false;

  for (const holder of topHolders) {
    // Check if holder is a known DEX program
    if (holder.label && (holder.label.includes("Raydium") || holder.label.includes("Orca") || holder.label.includes("Meteora"))) {
      dexPools.push(holder.label);
    }

    // Check if LP tokens are burned (sent to burn address or null address)
    if (BURN_ADDRESSES.has(holder.address) && holder.pct > 1) {
      lpBurned = true;
    }
  }

  // Also check top holder addresses against DEX programs
  for (const holder of topHolders) {
    const dexName = DEX_PROGRAMS[holder.address];
    if (dexName && !dexPools.includes(dexName)) {
      dexPools.push(dexName);
    }
  }

  return {
    hasLiquidity: dexPools.length > 0 || topHolders.some((h) => h.pct > 5),
    estimatedUsd: 0, // Would need price data to calculate
    lpBurned,
    dexPools,
  };
}

/**
 * Check 4: Token Metadata
 * Checks if the token has on-chain metadata and if it's mutable.
 */
async function checkMetadata(
  connection: Connection,
  mintPubkey: PublicKey
): Promise<{
  hasMetadata: boolean;
  isMutable: boolean;
  updateAuthority: string | null;
  name: string;
  symbol: string;
  uri: string;
}> {
  // Derive metadata PDA
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const metadataAccount = await connection.getAccountInfo(metadataPda);

  if (!metadataAccount) {
    return {
      hasMetadata: false,
      isMutable: false,
      updateAuthority: null,
      name: "",
      symbol: "",
      uri: "",
    };
  }

  // Parse Metaplex metadata account
  // Layout: [1 byte key] [32 bytes update_authority] [32 bytes mint] [4+name_len name] [4+symbol_len symbol] [4+uri_len uri] ...
  const data = metadataAccount.data;
  let offset = 1; // skip key byte

  const updateAuthority = new PublicKey(
    data.subarray(offset, offset + 32)
  ).toBase58();
  offset += 32;

  // Skip mint (32 bytes)
  offset += 32;

  // Name (4 byte length + string)
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data
    .subarray(offset, offset + nameLen)
    .toString("utf8")
    .replace(/\0/g, "")
    .trim();
  offset += nameLen;

  // Symbol (4 byte length + string)
  const symbolLen = data.readUInt32LE(offset);
  offset += 4;
  const symbol = data
    .subarray(offset, offset + symbolLen)
    .toString("utf8")
    .replace(/\0/g, "")
    .trim();
  offset += symbolLen;

  // URI (4 byte length + string)
  const uriLen = data.readUInt32LE(offset);
  offset += 4;
  const uri = data
    .subarray(offset, offset + uriLen)
    .toString("utf8")
    .replace(/\0/g, "")
    .trim();
  offset += uriLen;

  // Skip to isMutable — after seller_fee_basis_points (2 bytes), creators option, etc.
  // isMutable is near the end, at a variable offset. Simplify: check byte before last few fields
  // For safety, we'll read a known offset pattern
  // seller_fee_basis_points (2 bytes)
  offset += 2;

  // creators: Option<Vec<Creator>> — 1 byte option, then if Some: 4 byte len, then len * (32+1+1)
  const hasCreators = data.readUInt8(offset);
  offset += 1;
  if (hasCreators === 1) {
    const numCreators = data.readUInt32LE(offset);
    offset += 4;
    offset += numCreators * 34; // 32 address + 1 verified + 1 share
  }

  // primary_sale_happened (1 byte)
  offset += 1;

  // is_mutable (1 byte)
  const isMutable = data.readUInt8(offset) === 1;

  return { hasMetadata: true, isMutable, updateAuthority, name, symbol, uri };
}

/**
 * Build safety checks array with scoring
 */
function buildChecks(
  authorities: Awaited<ReturnType<typeof checkAuthorities>>,
  holders: Awaited<ReturnType<typeof checkHolderConcentration>>,
  liquidity: ReturnType<typeof analyzeLiquidity>,
  metadata: Awaited<ReturnType<typeof checkMetadata>>
): SafetyCheck[] {
  const checks: SafetyCheck[] = [];

  // 1. Mint Authority (weight: 25)
  checks.push({
    id: "mint_authority",
    label: "Mint Authority",
    description: authorities.mintAuthority.exists
      ? "Mint authority is still active — new tokens can be minted"
      : "Mint authority has been revoked — supply is fixed",
    status: authorities.mintAuthority.exists ? "fail" : "pass",
    weight: 25,
    details: authorities.mintAuthority.address
      ? `Authority: ${authorities.mintAuthority.address}`
      : undefined,
  });

  // 2. Freeze Authority (weight: 20)
  checks.push({
    id: "freeze_authority",
    label: "Freeze Authority",
    description: authorities.freezeAuthority.exists
      ? "Freeze authority is active — token accounts can be frozen"
      : "Freeze authority is disabled — accounts cannot be frozen",
    status: authorities.freezeAuthority.exists ? "fail" : "pass",
    weight: 20,
    details: authorities.freezeAuthority.address
      ? `Authority: ${authorities.freezeAuthority.address}`
      : undefined,
  });

  // 3. Top Holder Concentration (weight: 20)
  const concStatus =
    holders.concentration === "distributed"
      ? "pass"
      : holders.concentration === "moderate"
        ? "warn"
        : "fail";
  checks.push({
    id: "holder_concentration",
    label: "Holder Distribution",
    description: `Top 10 holders own ${holders.top10Pct.toFixed(1)}% of supply (${holders.concentration})`,
    status: concStatus,
    weight: 20,
    details: `Top 20 holders: ${holders.top20Pct.toFixed(1)}%`,
  });

  // 4. Liquidity (weight: 15)
  checks.push({
    id: "liquidity",
    label: "DEX Liquidity",
    description: liquidity.hasLiquidity
      ? `Found on ${liquidity.dexPools.length} DEX(es): ${liquidity.dexPools.join(", ") || "Unknown pool"}`
      : "No DEX liquidity pools detected",
    status: liquidity.hasLiquidity ? "pass" : "fail",
    weight: 15,
    details: liquidity.lpBurned
      ? "LP tokens appear to be burned (locked forever)"
      : "LP tokens are not burned",
  });

  // 5. LP Burn (weight: 10)
  checks.push({
    id: "lp_burned",
    label: "LP Lock/Burn",
    description: liquidity.lpBurned
      ? "LP tokens burned — liquidity is permanently locked"
      : "LP tokens not burned — liquidity could be pulled",
    status: liquidity.lpBurned ? "pass" : "warn",
    weight: 10,
  });

  // 6. Metadata Mutability (weight: 5)
  if (metadata.hasMetadata) {
    checks.push({
      id: "metadata_mutable",
      label: "Metadata",
      description: metadata.isMutable
        ? "Token metadata is mutable — name/symbol can be changed"
        : "Token metadata is immutable",
      status: metadata.isMutable ? "warn" : "pass",
      weight: 5,
      details: metadata.updateAuthority
        ? `Update authority: ${metadata.updateAuthority}`
        : undefined,
    });
  } else {
    checks.push({
      id: "metadata_mutable",
      label: "Metadata",
      description: "No on-chain metadata found",
      status: "info",
      weight: 5,
    });
  }

  // 7. Token Program (weight: 5)
  checks.push({
    id: "token_program",
    label: "Token Program",
    description:
      authorities.tokenProgram === "spl-token"
        ? "Standard SPL Token program"
        : "Token-2022 program (may have extensions like transfer fees)",
    status: authorities.tokenProgram === "spl-token" ? "pass" : "info",
    weight: 5,
  });

  return checks;
}

/**
 * Calculate overall safety score from individual checks
 */
function calculateOverallScore(checks: SafetyCheck[]): {
  score: number;
  verdict: "safe" | "caution" | "warning" | "danger";
} {
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const check of checks) {
    if (check.status === "info") continue; // Skip informational checks
    totalWeight += check.weight;
    if (check.status === "pass") earnedWeight += check.weight;
    else if (check.status === "warn") earnedWeight += check.weight * 0.5;
    // "fail" earns 0
  }

  const score =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  let verdict: "safe" | "caution" | "warning" | "danger";
  if (score >= 75) verdict = "safe";
  else if (score >= 50) verdict = "caution";
  else if (score >= 25) verdict = "warning";
  else verdict = "danger";

  return { score, verdict };
}

/**
 * Main scan function — runs all on-chain checks for a token mint
 */
export async function scanToken(mint: string): Promise<SafetyScanResponse> {
  // Check cache
  const cached = scanCache.get(mint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { result: cached.result, error: null, cached: true };
  }

  try {
    const mintPubkey = new PublicKey(mint);
    const connection = getConnection();

    // Run checks in parallel where possible
    const [authorities, holdersRaw, metadata] = await Promise.all([
      checkAuthorities(connection, mintPubkey),
      checkHolderConcentration(
        connection,
        mintPubkey,
        0, // We'll recalculate after we have supply
        0
      ),
      checkMetadata(connection, mintPubkey),
    ]);

    // Recalculate holder percentages with actual supply
    const holders = await checkHolderConcentration(
      connection,
      mintPubkey,
      authorities.supply.total,
      authorities.supply.decimals
    );

    // Analyze liquidity from holder data
    const liquidity = analyzeLiquidity(holders.topHolders);

    // Build safety checks
    const checks = buildChecks(authorities, holders, liquidity, metadata);

    // Calculate overall score
    const { score, verdict } = calculateOverallScore(checks);

    const result: SafetyScanResult = {
      mint,
      symbol: metadata.symbol || "Unknown",
      name: metadata.name || "Unknown Token",
      logoURI: "",
      scannedAt: new Date().toISOString(),
      overallScore: score,
      verdict,
      checks,
      supply: authorities.supply,
      mintAuthority: authorities.mintAuthority,
      freezeAuthority: authorities.freezeAuthority,
      holders: {
        topHolders: holders.topHolders.slice(0, 10),
        top10Pct: holders.top10Pct,
        top20Pct: holders.top20Pct,
        concentration: holders.concentration,
      },
      liquidity,
      metadata: {
        hasMetadata: metadata.hasMetadata,
        isMutable: metadata.isMutable,
        updateAuthority: metadata.updateAuthority,
      },
    };

    // Cache result
    scanCache.set(mint, { result, timestamp: Date.now() });

    return { result, error: null, cached: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scan error";
    return { result: null, error: message, cached: false };
  }
}
