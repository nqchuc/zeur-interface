// User Supply Positions (for Supply Page) - Users supply these debt assets to earn yield
export const userSupplyPositions = [
  {
    debtAsset: "0x1234...EURC",
    symbol: "EURC",
    name: "Euro Coin",
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/20641.png",
    supplyBalance: "2500.00",
    supplyBalanceUSD: "2500.00",
    supplyRate: "450", // 4.5% in bps
    utilizationRate: "750000000000000000", // 75%
    earned: "28.75", // Example earned amount
  },
  // {
  //   debtAsset: "0x5678...USDC",
  //   symbol: "USDC",
  //   name: "USD Coin",
  //   icon: "💵",
  //   supplyBalance: "1200.00",
  //   supplyBalanceUSD: "1200.00",
  //   supplyRate: "520", // 5.2% in bps
  //   utilizationRate: "729411764705882353", // 72.94%
  //   earned: "15.60",
  // },
]

// User Collateral Positions (for Borrow Page) - Users deposit these as collateral
export const userCollateralPositions = [
  {
    collateralAsset: "0xdef0...ETH",
    symbol: "ETH",
    name: "Ethereum",
    icon: "🔷",
    supplyBalance: "1.25",
    balanceUSD: "4275.00",
    ltv: "75.0",
    liquidationThreshold: "80.0",
    liquidationBonus: "5.0",
    borrowPower: "3206.25", // 75% of 4275
    currentUtilization: "65.0", // Currently using 65% of borrow power
  },
  {
    collateralAsset: "0x1111...stETH",
    symbol: "stETH",
    name: "Staked Ethereum",
    icon: "🟣",
    supplyBalance: "0.75",
    balanceUSD: "2561.25",
    ltv: "70.0",
    liquidationThreshold: "75.0",
    liquidationBonus: "7.5",
    borrowPower: "1792.88", // 70% of 2561.25
    currentUtilization: "58.0",
  },
]

// Debt Assets - These are the stablecoins users can supply or borrow
export const debtAssets = [
  {
    asset: "0x1234...EURC",
    symbol: "EURC",
    name: "Euro Coin",
    icon: "🇪🇺",
    decimals: 6,
    supplyCap: "10000000",
    borrowCap: "8000000",
    totalSupply: "2400000",
    totalBorrow: "1800000",
    utilizationRate: "750000000000000000", // 75% in 1e18
    supplyRate: "450", // 4.5% APR in bps
    borrowRate: "0", // 0% for zero-interest
    isFrozen: false,
    isPaused: false,
    color: "#8b5cf6",
    protocols: ["Morpho", "Aave"],
  },
  {
    asset: "0x5678...EURI",
    symbol: "EURI",
    name: "Euro Stablecoin",
    icon: "💶",
    decimals: 18,
    supplyCap: "5000000",
    borrowCap: "4000000",
    totalSupply: "1200000",
    totalBorrow: "900000",
    utilizationRate: "750000000000000000",
    supplyRate: "380",
    borrowRate: "0",
    isFrozen: false,
    isPaused: false,
    color: "#06b6d4",
    protocols: ["Compound", "Morpho"],
  },
  {
    asset: "0x9abc...USDC",
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    decimals: 6,
    supplyCap: "15000000",
    borrowCap: "12000000",
    totalSupply: "8500000",
    totalBorrow: "6200000",
    utilizationRate: "729411764705882353",
    supplyRate: "520",
    borrowRate: "0",
    isFrozen: false,
    isPaused: false,
    color: "#2775CA",
    protocols: ["Aave", "Compound"],
  },
]

// Collateral Assets - These are the assets users can deposit as collateral
export const collateralAssets = [
  {
    asset: "0xdef0...ETH",
    symbol: "ETH",
    name: "Ethereum",
    icon: "🔷",
    decimals: 18,
    supplyCap: "50000",
    borrowCap: "40000",
    totalSupply: "12500",
    ltv: "7500", // 75% in bps
    liquidationThreshold: "8000", // 80% in bps
    liquidationBonus: "500", // 5% in bps
    reserveFactor: "1000", // 10% in bps
    isFrozen: false,
    isPaused: false,
    color: "#627EEA",
    currentPrice: 3420,
    apy: "4.2%",
    stakedTokens: [
      { protocol: "Lido", amount: "8500", apy: "3.8%" },
      { protocol: "RocketPool", amount: "4000", apy: "4.1%" },
    ],
  },
  {
    asset: "0x1111...stETH",
    symbol: "stETH",
    name: "Staked Ethereum",
    icon: "🟣",
    decimals: 18,
    supplyCap: "30000",
    borrowCap: "24000",
    totalSupply: "8200",
    ltv: "7000",
    liquidationThreshold: "7500",
    liquidationBonus: "750",
    reserveFactor: "1000",
    isFrozen: false,
    isPaused: false,
    color: "#00A3FF",
    currentPrice: 3415,
    apy: "5.8%",
    stakedTokens: [{ protocol: "Lido", amount: "8200", apy: "5.8%" }],
  },
  {
    asset: "0x2222...WBTC",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    icon: "🟠",
    decimals: 8,
    supplyCap: "1000",
    borrowCap: "700",
    totalSupply: "245",
    ltv: "7000",
    liquidationThreshold: "7500",
    liquidationBonus: "1000",
    reserveFactor: "1500",
    isFrozen: false,
    isPaused: false,
    color: "#F7931A",
    currentPrice: 67800,
    apy: "2.9%",
    stakedTokens: [],
  },
  {
    asset: "0x3333...LINK",
    symbol: "LINK",
    name: "Chainlink",
    icon: "🔗",
    decimals: 18,
    supplyCap: "500000",
    borrowCap: "350000",
    totalSupply: "125000",
    ltv: "6500",
    liquidationThreshold: "7000",
    liquidationBonus: "1000",
    reserveFactor: "2000",
    isFrozen: false,
    isPaused: false,
    color: "#375BD2",
    currentPrice: 14.5,
    apy: "3.1%",
    stakedTokens: [],
  },
]

export const ASSET_METADATA: Record<string, { symbol: string; name: string; icon: string; color: string; protocols: string[] }> = {
  // Debt Assets (Stablecoins)
  "0xf170643aD2209E4cD9b17ddF8417D537E894d3e9": { 
    symbol: 'EURC', 
    name: 'Euro Coin', 
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20641.png', 
    color: '#8b5cf6', 
    protocols: ['Morpho', 'Aave'] 
  },
  '0x5678...EURI': { 
    symbol: 'EURI', 
    name: 'Euro Stablecoin', 
    icon: '💶', 
    color: '#06b6d4', 
    protocols: ['Compound', 'Morpho'] 
  },
  '0x9abc...USDC': { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    icon: '💵', 
    color: '#2775CA', 
    protocols: ['Aave', 'Compound'] 
  },
  
  // Collateral Assets
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', 
    color: '#627EEA', 
    protocols: ['Lido', 'RocketPool'] 
  },
  '0x1111...stETH': { 
    symbol: 'stETH', 
    name: 'Staked Ethereum', 
    icon: '🟣', 
    color: '#00A3FF', 
    protocols: ['Lido'] 
  },
  '0x2222...WBTC': { 
    symbol: 'WBTC', 
    name: 'Wrapped Bitcoin', 
    icon: '🟠', 
    color: '#F7931A', 
    protocols: [] 
  },
  "0x779877A7B0D9E8603169DdbD7836e478b4624789": { 
    symbol: 'LINK', 
    name: 'Chainlink', 
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png', 
    color: '#375BD2', 
    protocols: [] 
  },
}


export const vaultStrategies = [
  {
    name: "ETH Liquid Staking",
    risk: "Low",
    apy: "6.2%",
    color: "from-green-500 to-green-400",
    recommended: true,
    description: "Stake your ETH and earn yield through liquid staking protocols.",
    protocols: ["Lido", "RocketPool"],
  },
  {
    name: "Stablecoin Lending",
    risk: "Low",
    apy: "4.8%",
    color: "from-blue-500 to-blue-400",
    recommended: false,
    description: "Lend stablecoins and earn interest with minimal risk.",
    protocols: ["Aave", "Compound"],
  },
  {
    name: "DeFi Blue-Chip Vault",
    risk: "Medium",
    apy: "8.7%",
    color: "from-purple-500 to-purple-400",
    recommended: false,
    description: "Earn yield on a basket of blue-chip DeFi tokens.",
    protocols: ["Aave", "Yearn", "Curve"],
  },
]
