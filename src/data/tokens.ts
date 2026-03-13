export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
  coingeckoId: string;
}

export const TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    coingeckoId: "solana",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    coingeckoId: "usd-coin",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    coingeckoId: "tether",
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    logoURI: "https://static.jup.ag/jup/icon.png",
    coingeckoId: "jupiter-exchange-solana",
  },
  {
    symbol: "RAY",
    name: "Raydium",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    coingeckoId: "raydium",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    coingeckoId: "bonk",
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    logoURI: "https://bafkreibk3covs5ltyqxa272uodhber447nnr4kvfyjv2ykpre7hrid54ke.ipfs.nftstorage.link",
    coingeckoId: "dogwifcoin",
  },
  {
    symbol: "JTO",
    name: "Jito",
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    decimals: 9,
    logoURI: "https://metadata.jito.network/token/jto/image",
    coingeckoId: "jito-governance-token",
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png",
    coingeckoId: "pyth-network",
  },
  {
    symbol: "ORCA",
    name: "Orca",
    mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
    coingeckoId: "orca",
  },
  {
    symbol: "RENDER",
    name: "Render",
    mint: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof",
    decimals: 8,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png",
    coingeckoId: "render-token",
  },
  {
    symbol: "HNT",
    name: "Helium",
    mint: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",
    decimals: 8,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux/logo.png",
    coingeckoId: "helium",
  },
  {
    symbol: "W",
    name: "Wormhole",
    mint: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/wormhole-foundation/wormhole-token-list/main/assets/W_purple_512.png",
    coingeckoId: "wormhole",
  },
  {
    symbol: "POPCAT",
    name: "Popcat",
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    decimals: 9,
    logoURI: "https://bafkreidvkvuzyslw5jh5z242lgzwzhbi2kxxnpkm427q7zbhstmhcpsmoq.ipfs.nftstorage.link",
    coingeckoId: "popcat",
  },
  {
    symbol: "MSOL",
    name: "Marinade SOL",
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    coingeckoId: "msol",
  },
  {
    symbol: "TNSR",
    name: "Tensor",
    mint: "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6/logo.png",
    coingeckoId: "tensor",
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
  { id: "ray-usdc", tokenA: TOKENS[4], tokenB: TOKENS[1], tvl: 8_300_000, volume24h: 2_100_000, apr: 32.1, fee: 0.3 },
  { id: "bonk-sol", tokenA: TOKENS[5], tokenB: TOKENS[0], tvl: 6_500_000, volume24h: 4_200_000, apr: 67.8, fee: 1.0 },
  { id: "jup-usdc", tokenA: TOKENS[3], tokenB: TOKENS[1], tvl: 12_100_000, volume24h: 3_800_000, apr: 28.4, fee: 0.25 },
  { id: "jto-sol", tokenA: TOKENS[7], tokenB: TOKENS[0], tvl: 9_800_000, volume24h: 2_900_000, apr: 21.7, fee: 0.3 },
  { id: "wif-usdc", tokenA: TOKENS[6], tokenB: TOKENS[1], tvl: 4_200_000, volume24h: 3_100_000, apr: 89.3, fee: 1.0 },
  { id: "popcat-sol", tokenA: TOKENS[13], tokenB: TOKENS[0], tvl: 2_800_000, volume24h: 1_900_000, apr: 112.5, fee: 1.0 },
  { id: "pyth-usdc", tokenA: TOKENS[8], tokenB: TOKENS[1], tvl: 7_400_000, volume24h: 1_600_000, apr: 19.8, fee: 0.3 },
  { id: "render-usdc", tokenA: TOKENS[10], tokenB: TOKENS[1], tvl: 5_100_000, volume24h: 1_200_000, apr: 15.6, fee: 0.3 },
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
