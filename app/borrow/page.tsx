"use client"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  DollarSign,
  ChevronRight,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { collateralAssets, borrowAssets, vaultStrategies } from "@/lib/constants"

export default function BorrowPage() {
  const [collateralAsset, setCollateralAsset] = useState("ETH")
  const [borrowAsset, setBorrowAsset] = useState("EURC")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [ltv, setLtv] = useState([65])
  const [autoRepay, setAutoRepay] = useState(false)
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")

  const calculateBorrowAmount = () => {
    if (!collateralAmount) return "0"
    const collateralValue =
      Number.parseFloat(collateralAmount) * (collateralAssets.find((a) => a.symbol === collateralAsset)?.price || 0)
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          Borrow <span className="text-gradient-purple">EUR at 0%</span>
        </h1>
        <p className="text-slate-300 text-sm">Create zero-interest loans backed by your crypto assets</p>
      </div>

      {/* Interactive Loan Builder */}
      <Card className="card-dark rounded-xl overflow-hidden ">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <CardHeader className="pb-2 ">
          <CardTitle className="text-xl font-bold text-white flex items-center">
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

              {/* Collateral Selection */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {collateralAssets.map((asset) => (
                    <Button
                      key={asset.symbol}
                      variant="outline"
                      className={`token-selector-dark p-3 h-auto flex-col space-y-1 rounded-lg ${
                        collateralAsset === asset.symbol ? "border-purple-500 bg-purple-500/10 glow-purple" : ""
                      }`}
                      onClick={() => setCollateralAsset(asset.symbol)}
                    >
                      <span className="text-lg">{asset.icon}</span>
                      <span className="font-semibold text-white text-sm">{asset.symbol}</span>
                      <span className="text-xs text-slate-400">APY: {asset.apy}</span>
                    </Button>
                  ))}
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
                    className="input-dark text-lg py-3 pr-16 rounded-lg placeholder:text-slate-500"
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
                      className={`token-selector-dark p-3 h-auto flex-col space-y-1 rounded-lg ${
                        borrowAsset === asset.symbol ? "border-purple-500 bg-purple-500/10 glow-purple" : ""
                      }`}
                      onClick={() => setBorrowAsset(asset.symbol)}
                    >
                      <span className="text-lg">{asset.icon}</span>
                      <span className="font-semibold text-white text-sm">{asset.symbol}</span>
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
                    <div className="text-xl font-bold text-white">
                      €{borrowAmount} {borrowAsset}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">≈ ${borrowAmount} USD</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Interest Rate</div>
                      <div className="text-lg font-bold text-green-400">0%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <div className="text-xs text-slate-400">Collateral APY</div>
                      <div className="text-lg font-bold text-white">
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

      {/* Recommended Strategies */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Recommended Yield Strategies</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {vaultStrategies.map((strategy, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg card-dark ${
                strategy.recommended ? "border-purple-500/30 glow-purple" : ""
              } rounded-lg overflow-hidden`}
            >
              <div className={`h-1 bg-gradient-to-r ${strategy.color}`}></div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{strategy.name}</h3>
                  {strategy.recommended && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      <Star className="h-2 w-2 mr-1" />
                      Best
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Expected APY</span>
                  <span className="text-lg font-bold text-green-400">{strategy.apy}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Risk Level</span>
                  <Badge
                    className={`text-xs ${
                      strategy.risk === "Low"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : strategy.risk === "Medium"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {strategy.risk}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mb-2">{strategy.description}</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.protocols.map((protocol, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}