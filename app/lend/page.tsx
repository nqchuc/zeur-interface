"use client"
import { useState } from "react"
import {
  TrendingUp,
  Wallet,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { borrowAssets, collateralAssets } from "@/lib/constants"

export default function LendPage() {
  const [paymentMethod, setPaymentMethod] = useState("crypto")

  const topEarningAssets = [
    { asset: "ETH", icon: "🔷", apy: "4.2%", tvl: "$1.2M", strategy: "Balanced" },
    { asset: "stETH", icon: "🟣", apy: "5.8%", tvl: "$850K", strategy: "Conservative" },
    { asset: "EURC", icon: "🇪🇺", apy: "8.7%", tvl: "$320K", strategy: "Balanced" },
    { asset: "WBTC", icon: "🟠", apy: "2.9%", tvl: "$430K", strategy: "Conservative" },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          Earn <span className="text-gradient-purple">Yield</span> on Your Assets
        </h1>
        <p className="text-slate-300 text-sm">
          Deposit assets and earn optimized yields through automated strategies
        </p>
      </div>

      <Card className="card-dark rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center">
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
                    className={`token-selector-dark p-3 h-auto flex-col space-y-1 rounded-lg ${
                      paymentMethod === "crypto" ? "border-blue-500 bg-blue-500/10 glow-purple" : ""
                    }`}
                    onClick={() => setPaymentMethod("crypto")}
                  >
                    <Wallet className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold text-white text-sm">Crypto Wallet</span>
                    <span className="text-xs text-slate-400">Use existing tokens</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`token-selector-dark p-3 h-auto flex-col space-y-1 rounded-lg ${
                      paymentMethod === "fiat" ? "border-cyan-500 bg-cyan-500/10 glow-purple" : ""
                    }`}
                    onClick={() => setPaymentMethod("fiat")}
                  >
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                    <span className="font-semibold text-white text-sm">Credit Card</span>
                    <span className="text-xs text-slate-400">Buy with EUR/USD</span>
                  </Button>
                </div>
              </div>

              {/* Asset Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-white">Select Asset</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[...borrowAssets, ...collateralAssets.slice(0, 2)].map((asset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="token-selector-dark p-3 h-auto flex-col space-y-1 rounded-lg"
                    >
                      <span className="text-lg">{asset.icon}</span>
                      <span className="font-semibold text-white text-sm">{asset.symbol}</span>
                      <span className="text-xs text-slate-400">
                        {asset.apy || (asset.rate === "0%" ? "Stable" : asset.rate)}
                      </span>
                    </Button>
                  ))}
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
                  className="input-dark text-lg py-3 rounded-lg placeholder:text-slate-500"
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
                      className="token-selector-dark rounded-lg text-white hover:border-purple-500 text-xs px-3 py-2"
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
                            <span className="text-lg font-bold text-green-400">6.2%</span>
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
                            <span className="text-lg font-bold text-green-400">8.7%</span>
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
                            <span className="text-lg font-bold text-green-400">12.1%</span>
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

      {/* Top Earning Assets */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Top Earning Assets</h2>
        <Card className="card-dark rounded-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">Asset</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">Current APY</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">TVL</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">Strategy</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topEarningAssets.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                            {row.icon}
                          </div>
                          <span className="font-medium text-white text-sm">{row.asset}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-400 font-semibold text-sm">{row.apy}</td>
                      <td className="py-3 px-4 text-white text-sm">{row.tvl}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`text-xs ${
                            row.strategy === "Conservative"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : row.strategy === "Balanced"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {row.strategy}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-xs px-3 py-1"
                        >
                          Deposit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}