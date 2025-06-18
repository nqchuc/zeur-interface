export const collateralAssets = [
    { symbol: "ETH", name: "Ethereum", price: 3420, apy: "4.2%", icon: "🔷", color: "#627EEA" },
    { symbol: "stETH", name: "Staked Ethereum", price: 3415, apy: "5.8%", icon: "🟣", color: "#00A3FF" },
    { symbol: "LINK", name: "Chainlink", price: 14.5, apy: "3.1%", icon: "🔗", color: "#375BD2" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", price: 67800, apy: "2.9%", icon: "🟠", color: "#F7931A" },
]
  
export const borrowAssets = [
    { symbol: "EURC", name: "Euro Coin", icon: "🇪🇺", rate: "0%", color: "#8b5cf6" },
    { symbol: "EURI", name: "Euro Stablecoin", icon: "💶", rate: "0%", color: "#06b6d4" },
    { symbol: "USDC", name: "USD Coin", icon: "💵", rate: "0%", color: "#2775CA" },
]
  
export const vaultStrategies = [
    {
      name: "Conservative Yield",
      apy: "6.2%",
      risk: "Low",
      protocols: ["Lido", "RocketPool"],
      description: "Stable returns with minimal risk",
      color: "from-purple-500 to-blue-500",
    },
    {
      name: "Balanced Growth",
      apy: "8.7%",
      risk: "Medium",
      protocols: ["Morpho", "Aave", "Lido"],
      description: "Optimized yield with moderate risk",
      color: "from-blue-500 to-cyan-500",
      recommended: true,
    },
    {
      name: "High Yield",
      apy: "12.1%",
      risk: "High",
      protocols: ["Morpho", "Compound", "Yearn"],
      description: "Maximum returns for risk-tolerant users",
      color: "from-cyan-500 to-purple-500",
    },
]