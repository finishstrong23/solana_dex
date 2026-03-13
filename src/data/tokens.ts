export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
}

export const TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  },
  {
    symbol: "RAY",
    name: "Raydium",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
  },
  {
    symbol: "JTO",
    name: "Jito",
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    decimals: 9,
    logoURI: "https://metadata.jito.network/token/jto/image",
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    logoURI: "https://bafkreibk3covs5ltyqxa272uodhber447nnr4kvfyjv2ykpre7hrid54ke.ipfs.nftstorage.link",
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    logoURI: "https://static.jup.ag/jup/icon.png",
  },
];

export interface Pool {
  id: string;
  tokenA: Token;
  tokenB: Token;
  tvl: number;
  volume24h: number;
  apr: number;
  fee: number;
}

export const POOLS: Pool[] = [
  { id: "sol-usdc", tokenA: TOKENS[0], tokenB: TOKENS[1], tvl: 45_200_000, volume24h: 12_800_000, apr: 24.5, fee: 0.25 },
  { id: "sol-usdt", tokenA: TOKENS[0], tokenB: TOKENS[2], tvl: 18_700_000, volume24h: 5_400_000, apr: 18.2, fee: 0.25 },
  { id: "ray-usdc", tokenA: TOKENS[3], tokenB: TOKENS[1], tvl: 8_300_000, volume24h: 2_100_000, apr: 32.1, fee: 0.3 },
  { id: "bonk-sol", tokenA: TOKENS[4], tokenB: TOKENS[0], tvl: 6_500_000, volume24h: 4_200_000, apr: 67.8, fee: 1.0 },
  { id: "jup-usdc", tokenA: TOKENS[7], tokenB: TOKENS[1], tvl: 12_100_000, volume24h: 3_800_000, apr: 28.4, fee: 0.25 },
  { id: "jto-sol", tokenA: TOKENS[5], tokenB: TOKENS[0], tvl: 9_800_000, volume24h: 2_900_000, apr: 21.7, fee: 0.3 },
  { id: "wif-usdc", tokenA: TOKENS[6], tokenB: TOKENS[1], tvl: 4_200_000, volume24h: 3_100_000, apr: 89.3, fee: 1.0 },
];

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (n < 0.01 && n > 0) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

export function formatPrice(n: number): string {
  if (n < 0.001) return n.toFixed(8);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
}
