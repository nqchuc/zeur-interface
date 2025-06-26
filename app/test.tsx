"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Star,
  Wallet,
  CreditCard,
  Target,
  ChevronRight,
  BarChart3,
  PieChart,
  History,
  Users,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ZeurLendingApp() {
  const [mode, setMode] = useState<"lend" | "borrow">("borrow")
  const [collateralAsset, setCollateralAsset] = useState("ETH")
  const [borrowAsset, setBorrowAsset] = useState("EURC")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [ltv, setLtv] = useState([65])
  const [autoRepay, setAutoRepay] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("crypto")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedLendAsset, setSelectedLendAsset] = useState("EURC")

  // Mock user debt positions data
  const userDebtPositions = [
    {
      debtAsset: "0x1234...EURC",
      symbol: "EURC",
      name: "Euro Coin",
      icon: "🇪🇺",
      supplyBalance: "2500.00",
      borrowBalance: "1800.00",
      balanceUSD: "1980.00",
      ltv: "72.0",
      liqLTV: "85.0",
      penalty: "5.0",
      netBorrow: "700.00",
      interestRate: "0.0",
    },
    {
      debtAsset: "0x5678...USDC",
      symbol: "USDC",
      name: "USD Coin",
      icon: "💵",
      supplyBalance: "1200.00",
      borrowBalance: "800.00",
      balanceUSD: "800.00",
      ltv: "66.7",
      liqLTV: "80.0",
      penalty: "10.0",
      netBorrow: "400.00",
      interestRate: "0.0",
    },
  ]

  // Mock user collateral positions data
  const userCollateralPositions = [
    {
      collateralAsset: "0xdef0...ETH",
      symbol: "ETH",
      name: "Ethereum",
      icon: "🔷",
      supplyBalance: "1.25",
      balanceUSD: "4275.00",
      netBase: "0.85",
      baseRate: "2.1",
      currentRate: "4.2",
      utilizationRate: "75.5",
    },
    {
      collateralAsset: "0x1111...stETH",
      symbol: "stETH",
      name: "Staked Ethereum",
      icon: "🟣",
      supplyBalance: "0.75",
      balanceUSD: "2561.25",
      netBase: "0.65",
      baseRate: "3.2",
      currentRate: "5.8",
      utilizationRate: "68.2",
    },
  ]

  // Mock asset data based on AssetData structure
  const debtAssets = [
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

  const collateralAssets = [
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

  const vaultStrategies = [
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

  const borrowAssets = [
    {
      asset: "0x1234...EURC",
      symbol: "EURC",
      name: "Euro Coin",
      icon: "🇪🇺",
      decimals: 6,
      rate: "0%",
    },
    {
      asset: "0x5678...USDC",
      symbol: "USDC",
      name: "USD Coin",
      icon: "💵",
      decimals: 6,
      rate: "0%",
    },
    {
      asset: "0x9abc...DAI",
      symbol: "DAI",
      name: "Dai Stablecoin",
      icon: "♦️",
      decimals: 18,
      rate: "0%",
    },
  ]

  // Helper functions
  const formatNumber = (num: string | number, decimals = 2) => {
    const value = typeof num === "string" ? Number.parseFloat(num) : num
    if (value >= 1000000) return `${(value / 1000000).toFixed(decimals)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(decimals)}K`
    return value.toFixed(decimals)
  }

  const formatPercentage = (bps: string) => {
    return `${(Number.parseInt(bps) / 100).toFixed(2)}%`
  }

  const formatUtilization = (rate: string) => {
    return `${(Number.parseInt(rate) / 1e16).toFixed(1)}%`
  }

  const calculateBorrowAmount = () => {
    if (!collateralAmount) return "0"
    const collateralValue =
      Number.parseFloat(collateralAmount) *
      (collateralAssets.find((a) => a.symbol === collateralAsset)?.currentPrice || 0)
    return (collateralValue * (ltv[0] / 100)).toFixed(2)
  }

  const calculateHealthFactor = () => {
    const currentLtv = ltv[0]
    if (currentLtv < 50) return { value: 2.5, status: "Excellent", color: "text-green-400" }
    if (currentLtv < 70) return { value: 1.8, status: "Good", color: "text-blue-400" }
    if (currentLtv < 80) return { value: 1.2, status: "Moderate", color: "text-yellow-400" }
    return { value: 1.0, status: "Risky", color: "text-red-400" }
  }

  useEffect(() => {
    setBorrowAmount(calculateBorrowAmount())
  }, [collateralAmount, collateralAsset, ltv])

  const healthFactor = calculateHealthFactor()

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 navbar-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gradient-purple">Zeur</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                className={`text-slate-300 hover:text-white ${activeTab === "dashboard" ? "text-purple-400" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className={`text-slate-300 hover:text-white ${activeTab === "borrow" ? "text-purple-400" : ""}`}
                onClick={() => setActiveTab("borrow")}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Borrow
              </Button>
              <Button
                variant="ghost"
                className={`text-slate-300 hover:text-white ${activeTab === "lend" ? "text-purple-400" : ""}`}
                onClick={() => setActiveTab("lend")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Lend
              </Button>
              <Button
                variant="ghost"
                className={`text-slate-300 hover:text-white ${activeTab === "history" ? "text-purple-400" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </Badge>
            <Button className="btn-secondary-dark rounded-lg">
              <Wallet className="h-4 w-4 mr-2" />
              0x1234...5678
            </Button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-6">
        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to <span className="text-gradient-purple">Zeur</span>
              </h1>
              <p className="text-slate-300">Manage your positions and explore DeFi opportunities</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Value Locked",
                  value: "$12.4M",
                  icon: <TrendingUp className="h-4 w-4" />,
                  color: "from-purple-500 to-blue-500",
                },
                {
                  label: "Active Users",
                  value: "2,847",
                  icon: <Users className="h-4 w-4" />,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  label: "EUR Borrowed",
                  value: "€8.2M",
                  icon: <DollarSign className="h-4 w-4" />,
                  color: "from-cyan-500 to-purple-500",
                },
                {
                  label: "Average Yield",
                  value: "12.5%",
                  icon: <Star className="h-4 w-4" />,
                  color: "from-purple-500 to-pink-500",
                },
              ].map((stat, index) => (
                <Card key={index} className="stats-card rounded-lg overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">{stat.label}</span>
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
              {[
                { icon: <DollarSign className="h-4 w-4" />, label: "New Loan", color: "from-purple-500 to-blue-500" },
                { icon: <TrendingUp className="h-4 w-4" />, label: "Deposit", color: "from-blue-500 to-cyan-500" },
                { icon: <ArrowLeftRight className="h-4 w-4" />, label: "Swap", color: "from-cyan-500 to-purple-500" },
                { icon: <Target className="h-4 w-4" />, label: "Auto-Repay", color: "from-purple-500 to-pink-500" },
              ].map((action, index) => (
                <Button
                  key={index}
                  className={`rounded-lg h-auto py-2 px-4 bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all min-w-[100px] flex-shrink-0`}
                  onClick={() => setActiveTab(action.label.toLowerCase().includes("loan") ? "borrow" : "lend")}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
                      {action.icon}
                    </div>
                    <span className="text-sm">{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Your Positions */}
            <Card className="card-dark rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">Your Positions</CardTitle>
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                          🔷
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">ETH Collateral</div>
                          <div className="text-xs text-slate-400">0.5 ETH ($1,710)</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Borrowed</div>
                        <div className="font-semibold text-white">€1,000 EURC</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Health Factor</div>
                        <div className="font-semibold text-green-400">1.8</div>
                      </div>
                      <div>
                        <div className="text-slate-400">APY Earned</div>
                        <div className="font-semibold text-white">4.2%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                          🟣
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">stETH Deposit</div>
                          <div className="text-xs text-slate-400">1.2 stETH ($4,098)</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Earning</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Strategy</div>
                        <div className="font-semibold text-white">Balanced</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Current APY</div>
                        <div className="font-semibold text-green-400">5.8%</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Earned</div>
                        <div className="font-semibold text-white">+0.02 ETH</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Overview */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-dark rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-white">Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-slate-800/50 rounded-lg flex items-center justify-center">
                    <PieChart className="h-20 w-20 text-purple-400 opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-slate-300">ETH (45%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-slate-300">stETH (30%)</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-xs text-slate-300">WBTC (15%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span className="text-xs text-slate-300">LINK (10%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-white">Yield Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vaultStrategies.map((strategy, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg flex items-center justify-between ${
                          strategy.recommended ? "bg-purple-500/10 border border-purple-500/20" : "bg-slate-800/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${strategy.color} flex items-center justify-center text-white text-sm`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm flex items-center">
                              {strategy.name}
                              {strategy.recommended && (
                                <Badge className="ml-1 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                  <Star className="h-2 w-2 mr-1" />
                                  Best
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{strategy.risk} Risk</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-400">{strategy.apy}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Borrow View */}
        {activeTab === "borrow" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                Borrow <span className="text-gradient-purple">EUR at 0%</span>
              </h1>
              <p className="text-slate-300 text-sm">Create zero-interest loans backed by your crypto assets</p>
            </div>
            {/* Interactive Loan Builder */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Available Assets (30%) */}
              <div className="lg:w-[30%] order-1 lg:order-1">
                <Card className="card-dark rounded-xl overflow-hidden h-fit">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-white">Available Collateral</CardTitle>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        Yield Generating
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 h-[500px] overflow-y-auto scrollbar-hide">
                    <div className="space-y-2">
                      {collateralAssets.map((asset, index) => (
                        <div
                          key={index}
                          className={`card-dark rounded-lg p-3 cursor-pointer transition-all hover:glow-purple ${
                            collateralAsset === asset.symbol ? "border-purple-500/50 glow-purple bg-purple-500/5" : ""
                          }`}
                          onClick={() => setCollateralAsset(asset.symbol)}
                        >
                          {/* First Row - Asset Info and APY */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                  collateralAsset === asset.symbol
                                    ? "bg-purple-500/20 border-2 border-purple-500/50"
                                    : `bg-[${asset.color}20]`
                                }`}
                              >
                                {asset.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm flex items-center">
                                  {asset.symbol}
                                  {collateralAsset === asset.symbol && (
                                    <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400">{asset.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400 text-base">{asset.apy}</div>
                              <div className="text-xs text-slate-400">APY</div>
                            </div>
                          </div>

                          {/* Second Row - Key Metrics */}
                          <div className="flex flex-row justify-between items-center">
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Max LTV</div>
                              <div className="font-semibold text-white text-sm">{formatPercentage(asset.ltv)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Liq. Threshold</div>
                              <div className="font-semibold text-yellow-400 text-sm">
                                {formatPercentage(asset.liquidationThreshold)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Total Deposited</div>
                              <div className="font-semibold text-white text-sm">{formatNumber(asset.totalSupply)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Loan Form (70%) */}
              <div className="lg:w-[70%] order-2 lg:order-2">
                <Card className="card-dark rounded-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                      Zero Interest Loan Builder
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                      Design your perfect loan with our interactive builder
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-12 gap-4">
                      {/* Left Column - Loan Configuration */}
                      <div className="md:col-span-7 space-y-4">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <span className="font-semibold text-white text-sm">Select Collateral</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400 text-xs">
                            <span>2. Configure</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>3. Review</span>
                          </div>
                        </div>

                        {/* Selected Asset Information */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-white">Selected Collateral Asset</Label>
                          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                            {(() => {
                              const selectedAsset = collateralAssets.find((a) => a.symbol === collateralAsset)
                              return selectedAsset ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-lg">
                                        {selectedAsset.icon}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-white text-base">{selectedAsset.symbol}</div>
                                        <div className="text-sm text-slate-400">{selectedAsset.name}</div>
                                      </div>
                                    </div>
                                    {/* <div className="text-right">
                                      <div className="font-bold text-green-400 text-lg">{selectedAsset.apy}</div>
                                      <div className="text-xs text-slate-400">Current APY</div>
                                    </div> */}
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Max LTV</div>
                                      <div className="font-semibold text-white text-sm">
                                        {formatPercentage(selectedAsset.ltv)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Liq. Threshold</div>
                                      <div className="font-semibold text-yellow-400 text-sm">
                                        {formatPercentage(selectedAsset.liquidationThreshold)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Current Price</div>
                                      <div className="font-semibold text-white text-sm">
                                        ${formatNumber(selectedAsset.currentPrice)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="text-xs text-slate-400 mb-2">Yield Strategy</div>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedAsset.stakedTokens.map((token, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-2 py-1"
                                        >
                                          <span className="text-xs text-white">{token.protocol}</span>
                                          <span className="text-xs text-green-400">{token.apy}</span>
                                        </div>
                                      ))}
                                      {selectedAsset.stakedTokens.length === 0 && (
                                        <span className="text-xs text-slate-400">Direct holding - no staking</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="collateral-amount" className="text-sm font-semibold text-white">
                            Collateral Amount
                          </Label>
                          <div className="relative">
                            <Input
                              id="collateral-amount"
                              type="number"
                              placeholder="0.0"
                              value={collateralAmount}
                              onChange={(e) => setCollateralAmount(e.target.value)}
                              className="input-dark text-base py-3 pr-16 rounded-lg placeholder:text-slate-500"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold text-sm">
                              {collateralAsset}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">Balance: 0 {collateralAsset} (~$0.00)</div>
                        </div>

                        {/* LTV Slider */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold text-white">Loan-to-Value Ratio</Label>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              {ltv[0]}%
                            </Badge>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <Slider value={ltv} onValueChange={setLtv} max={80} min={10} step={5} className="w-full" />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                              <span>Conservative (10%)</span>
                              <span>Aggressive (80%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Borrow Asset */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-white">Borrow Asset</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {borrowAssets.map((asset) => (
                              <Button
                                key={asset.symbol}
                                variant="outline"
                                className={`token-selector-dark p-2 h-auto flex-col space-y-1 rounded-lg ${
                                  borrowAsset === asset.symbol ? "border-purple-500 bg-purple-500/10 glow-purple" : ""
                                }`}
                                onClick={() => setBorrowAsset(asset.symbol)}
                              >
                                <span className="text-base">{asset.icon}</span>
                                <span className="font-semibold text-white text-xs">{asset.symbol}</span>
                                <span className="text-xs text-slate-400">{asset.rate} Interest</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Loan Preview */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                          <h3 className="text-sm font-semibold text-white mb-3">Loan Preview</h3>

                          <div className="space-y-3">
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <div className="text-xs text-slate-400 mb-1">You'll Receive</div>
                              <div className="text-lg font-bold text-white">
                                €{borrowAmount} {borrowAsset}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">≈ ${borrowAmount} USD</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-800/50 rounded-lg p-2">
                                <div className="text-xs text-slate-400">Interest Rate</div>
                                <div className="text-base font-bold text-green-400">0%</div>
                              </div>
                              <div className="bg-slate-800/50 rounded-lg p-2">
                                <div className="text-xs text-slate-400">Collateral APY</div>
                                <div className="text-base font-bold text-white">
                                  {collateralAssets.find((a) => a.symbol === collateralAsset)?.apy || "0%"}
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-xs text-slate-400">Health Factor</div>
                                <div className={`text-sm font-bold ${healthFactor.color}`}>{healthFactor.value}</div>
                              </div>
                              <Progress value={ltv[0]} max={85} className="h-1" />
                              <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Safe</span>
                                <span>Liquidation at 85%</span>
                              </div>
                            </div>

                            {/* Auto Repay Settings */}
                            <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-xs font-semibold text-white">Auto Swap-Repay</Label>
                                  <p className="text-xs text-slate-400">Automatically repay when conditions are met</p>
                                </div>
                                <Switch checked={autoRepay} onCheckedChange={setAutoRepay} />
                              </div>

                              {autoRepay && (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                  <div>
                                    <Label htmlFor="stop-loss" className="text-xs font-medium text-slate-300">
                                      Stop Loss
                                    </Label>
                                    <Input
                                      id="stop-loss"
                                      type="number"
                                      placeholder="2800"
                                      value={stopLoss}
                                      onChange={(e) => setStopLoss(e.target.value)}
                                      className="input-dark mt-1 rounded-lg text-xs h-8"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="take-profit" className="text-xs font-medium text-slate-300">
                                      Take Profit
                                    </Label>
                                    <Input
                                      id="take-profit"
                                      type="number"
                                      placeholder="4000"
                                      value={takeProfit}
                                      onChange={(e) => setTakeProfit(e.target.value)}
                                      className="input-dark mt-1 rounded-lg text-xs h-8"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            size="lg"
                            className="w-full btn-primary-purple rounded-lg py-3 text-sm font-semibold mt-3"
                          >
                            Create Loan
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* User Debt Positions Table */}
            <Card className="card-dark rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">Your Debt Positions</CardTitle>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    {userDebtPositions.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-xs font-medium text-slate-400 pb-3">Asset</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Supply Balance</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Borrow Balance</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Balance USD</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">LTV</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Liq LTV / Penalty</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Net / Borrow</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDebtPositions.map((position, index) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                                {position.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{position.symbol}</div>
                                <div className="text-xs text-slate-400">{position.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">{position.supplyBalance}</div>
                            <div className="text-xs text-slate-400">{position.symbol}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">{position.borrowBalance}</div>
                            <div className="text-xs text-slate-400">{position.symbol}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">${position.balanceUSD}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">{position.ltv}%</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-yellow-400 text-sm">{position.liqLTV}%</div>
                            <div className="text-xs text-red-400">{position.penalty}% penalty</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-green-400 text-sm">{position.netBorrow}</div>
                            <div className="text-xs text-slate-400">{position.interestRate}% APR</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                Repay
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lend View */}
        {activeTab === "lend" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                Earn <span className="text-gradient-purple">Yield</span> on Your Assets
              </h1>
              <p className="text-slate-300 text-sm">
                Deposit assets and earn optimized yields through automated strategies
              </p>
            </div>
            {/* Yield Optimization Platform */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Available Debt Assets (30%) */}
              <div className="lg:w-[30%] order-1 lg:order-1">
                <Card className="card-dark rounded-xl overflow-hidden h-fit">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-white">Available Assets</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Earn Yield</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 h-[500px] overflow-y-auto scrollbar-hide">
                    <div className="space-y-2">
                      {debtAssets.map((asset, index) => (
                        <div
                          key={index}
                          className={`card-dark rounded-lg p-3 cursor-pointer transition-all hover:glow-purple ${
                            selectedLendAsset === asset.symbol ? "border-blue-500/50 glow-purple bg-blue-500/5" : ""
                          }`}
                          onClick={() => setSelectedLendAsset(asset.symbol)}
                        >
                          {/* First Row - Asset Info and APY */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                  selectedLendAsset === asset.symbol
                                    ? "bg-blue-500/20 border-2 border-blue-500/50"
                                    : `bg-[${asset.color}20]`
                                }`}
                              >
                                {asset.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm flex items-center">
                                  {asset.symbol}
                                  {selectedLendAsset === asset.symbol && (
                                    <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400">{asset.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400 text-base">
                                {formatPercentage(asset.supplyRate)}
                              </div>
                              <div className="text-xs text-slate-400">APY</div>
                            </div>
                          </div>

                          {/* Second Row - Key Metrics */}
                          <div className="flex flex-row justify-between items-center">
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Available</div>
                              <div className="font-semibold text-white text-sm">
                                {formatNumber(Number.parseInt(asset.supplyCap) - Number.parseInt(asset.totalSupply))}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Utilization</div>
                              <div className="font-semibold text-cyan-400 text-sm">
                                {formatUtilization(asset.utilizationRate)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">Total Deposited</div>
                              <div className="font-semibold text-white text-sm">{formatNumber(asset.totalSupply)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Lend Form (70%) */}
              <div className="lg:w-[70%] order-2 lg:order-2">
                <Card className="card-dark rounded-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                      Yield Optimization Platform
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                      Maximize your returns with AI-powered yield strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-12 gap-4">
                      {/* Left Column */}
                      <div className="md:col-span-7 space-y-4">
                        {/* Payment Method */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-white">Payment Method</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              className={`token-selector-dark p-2 h-auto flex-col space-y-1 rounded-lg ${
                                paymentMethod === "crypto" ? "border-blue-500 bg-blue-500/10 glow-purple" : ""
                              }`}
                              onClick={() => setPaymentMethod("crypto")}
                            >
                              <Wallet className="h-4 w-4 text-blue-400" />
                              <span className="font-semibold text-white text-xs">Crypto Wallet</span>
                              <span className="text-xs text-slate-400">Use existing tokens</span>
                            </Button>
                            <Button
                              variant="outline"
                              className={`token-selector-dark p-2 h-auto flex-col space-y-1 rounded-lg ${
                                paymentMethod === "fiat" ? "border-cyan-500 bg-cyan-500/10 glow-purple" : ""
                              }`}
                              onClick={() => setPaymentMethod("fiat")}
                            >
                              <CreditCard className="h-4 w-4 text-cyan-400" />
                              <span className="font-semibold text-white text-xs">Credit Card</span>
                              <span className="text-xs text-slate-400">Buy with EUR/USD</span>
                            </Button>
                          </div>
                        </div>

                        {/* Selected Asset Information */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-white">Selected Lending Asset</Label>
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                            {(() => {
                              const selectedAsset = debtAssets.find((a) => a.symbol === selectedLendAsset)
                              return selectedAsset ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center text-lg">
                                        {selectedAsset.icon}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-white text-base">{selectedAsset.symbol}</div>
                                        <div className="text-sm text-slate-400">{selectedAsset.name}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-green-400 text-lg">
                                        {formatPercentage(selectedAsset.supplyRate)}
                                      </div>
                                      <div className="text-xs text-slate-400">Current APY</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Available</div>
                                      <div className="font-semibold text-white text-sm">
                                        {formatNumber(
                                          Number.parseInt(selectedAsset.supplyCap) -
                                            Number.parseInt(selectedAsset.totalSupply),
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Utilization</div>
                                      <div className="font-semibold text-cyan-400 text-sm">
                                        {formatUtilization(selectedAsset.utilizationRate)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-slate-400">Supply Cap</div>
                                      <div className="font-semibold text-white text-sm">
                                        {formatNumber(selectedAsset.supplyCap)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="text-xs text-slate-400 mb-2">Supported Protocols</div>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedAsset.protocols.map((protocol, index) => (
                                        <div key={index} className="bg-slate-700/50 rounded-lg px-2 py-1">
                                          <span className="text-xs text-white">{protocol}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="deposit-amount" className="text-sm font-semibold text-white">
                            Deposit Amount
                          </Label>
                          <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="1000"
                            className="input-dark text-base py-3 rounded-lg placeholder:text-slate-500"
                          />
                        </div>

                        {/* Duration Selector */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-white">Lock Duration (Optional)</Label>
                          <div className="flex space-x-2">
                            {["Flexible", "30 Days", "90 Days", "180 Days"].map((duration, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="token-selector-dark rounded-lg text-white hover:border-purple-500 text-xs px-2 py-1"
                              >
                                {duration}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            Longer lock periods earn higher APY. Flexible deposits can be withdrawn anytime.
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                          <h3 className="text-sm font-semibold text-white mb-3">Strategy Selection</h3>

                          <div className="space-y-3">
                            <Tabs defaultValue="balanced" className="w-full">
                              <TabsList className="grid grid-cols-3 mb-3 bg-slate-800/50 h-8">
                                <TabsTrigger
                                  value="conservative"
                                  className="rounded-l-lg text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs"
                                >
                                  Conservative
                                </TabsTrigger>
                                <TabsTrigger
                                  value="balanced"
                                  className="border-x border-slate-600 text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs"
                                >
                                  Balanced
                                </TabsTrigger>
                                <TabsTrigger
                                  value="aggressive"
                                  className="rounded-r-lg text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs"
                                >
                                  Aggressive
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="conservative">
                                <Card className="card-dark border-green-500/20">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Expected APY</span>
                                      <span className="text-base font-bold text-green-400">6.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Risk Level</span>
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                        Low
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-2">
                                      Stable returns with minimal risk. Primarily uses liquid staking protocols.
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Lido
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        RocketPool
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="balanced">
                                <Card className="card-dark border-blue-500/20">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Expected APY</span>
                                      <span className="text-base font-bold text-green-400">8.7%</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Risk Level</span>
                                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                        Medium
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-2">
                                      Optimized yield with moderate risk. Combines lending and liquid staking.
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Morpho
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Aave
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Lido
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                              <TabsContent value="aggressive">
                                <Card className="card-dark border-yellow-500/20">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Expected APY</span>
                                      <span className="text-base font-bold text-green-400">12.1%</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Risk Level</span>
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                        High
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-300 mb-2">
                                      Maximum returns for risk-tolerant users. Uses advanced yield strategies.
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Morpho
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Compound
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        Yearn
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>

                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-xs text-slate-400">Estimated Earnings</div>
                                <div className="text-sm font-bold text-green-400">+€87/year</div>
                              </div>
                              <p className="text-xs text-slate-400">Based on €1,000 deposit with Balanced strategy</p>
                            </div>

                            {/* Action Button */}
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg py-3 text-sm font-semibold transition-all"
                            >
                              Start Earning
                              <TrendingUp className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* User Collateral Positions Table */}
            <Card className="card-dark rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">Your Collateral Positions</CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {userCollateralPositions.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-xs font-medium text-slate-400 pb-3">Asset</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Supply Balance</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Balance USD</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Net / Base</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Rates</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Utilization</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCollateralPositions.map((position, index) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                                {position.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{position.symbol}</div>
                                <div className="text-xs text-slate-400">{position.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">{position.supplyBalance}</div>
                            <div className="text-xs text-slate-400">{position.symbol}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">${position.balanceUSD}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-white text-sm">{position.netBase}</div>
                            <div className="text-xs text-slate-400">Net {position.symbol}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-green-400 text-sm">{position.currentRate}%</div>
                            <div className="text-xs text-slate-400">{position.baseRate}% base</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-cyan-400 text-sm">{position.utilizationRate}%</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                Withdraw
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History View */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                Transaction <span className="text-gradient-purple">History</span>
              </h1>
              <p className="text-slate-300 text-sm">Track all your lending and borrowing activities</p>
            </div>

            <Card className="card-dark rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: "Borrow",
                      amount: "€1,000 EURC",
                      collateral: "0.5 ETH",
                      date: "2024-01-15",
                      status: "Active",
                      color: "purple",
                    },
                    {
                      type: "Deposit",
                      amount: "1.2 stETH",
                      collateral: "-",
                      date: "2024-01-10",
                      status: "Earning",
                      color: "blue",
                    },
                    {
                      type: "Repay",
                      amount: "€500 EURC",
                      collateral: "0.25 ETH Released",
                      date: "2024-01-05",
                      status: "Completed",
                      color: "green",
                    },
                  ].map((tx, index) => (
                    <div key={index} className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-${tx.color}-500/20 flex items-center justify-center`}>
                          {tx.type === "Borrow" && <DollarSign className="h-4 w-4 text-purple-400" />}
                          {tx.type === "Deposit" && <TrendingUp className="h-4 w-4 text-blue-400" />}
                          {tx.type === "Repay" && <ArrowRight className="h-4 w-4 text-green-400" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{tx.type}</div>
                          <div className="text-xs text-slate-400">{tx.amount}</div>
                          {tx.collateral !== "-" && <div className="text-xs text-slate-500">{tx.collateral}</div>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">{tx.date}</div>
                        <Badge
                          className={`text-xs ${
                            tx.status === "Active"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : tx.status === "Earning"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
