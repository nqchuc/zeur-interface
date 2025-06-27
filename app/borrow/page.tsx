  "use client"
  import { useState, useEffect } from "react"
  import {
    ArrowRight,
    DollarSign,
    ChevronRight,
    Star,
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
  import {  collateralAssets, userCollateralPositions, userDebtPositions,  } from "@/lib/constants"
  import { formatNumber, formatPercentage } from "@/lib/helper"
  import { useSupply } from "@/hooks/contexts/SupplyHookContext"
  import { FormattedCollateralData, useBorrow } from "@/hooks/contexts/BorrowHookContext"
import { FormattedAssetData } from "@/types/contracts"

  export default function BorrowPage() {
    const [collateralAsset, setCollateralAsset] = useState<FormattedCollateralData|null>(null)
    const [borrowAsset, setBorrowAsset] = useState("EURC")
    const [collateralAmount, setCollateralAmount] = useState("")
    const [borrowAmount, setBorrowAmount] = useState("")
    const [maxLtv, setMaxLtv] = useState(0.0);
    const [ltv, setLtv] = useState([0])
    const [autoRepay, setAutoRepay] = useState(false)
    const [stopLoss, setStopLoss] = useState("")
    const [takeProfit, setTakeProfit] = useState("")

    //Hook
    const {debtAssets,} = useSupply();
    const {collateralAssets} = useBorrow();



    const calculateBorrowAmount = () => {
      if (!collateralAmount) return "0"
      if (!collateralAsset) return "0"

      console.log(collateralAsset.ltv , "LTV")

      const collateralValue =
        Number.parseFloat(collateralAmount) *
        (collateralAssets.find((a) => a.symbol === collateralAsset?.symbol)?.currentPrice  || 0) 

      return ((collateralValue  / 1.15) * ltv[0] / 100 ).toFixed(6)

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

    useEffect(() => {
      console.log("colatteralAssets", collateralAssets)
    }, [collateralAssets])

    useEffect(() => {
      setMaxLtv(Number(collateralAsset?.ltv))
    }, [collateralAsset])

    useEffect(() => {
      console.log(ltv, "LTV")
    }, [ltv])
    
    
    

    return (
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
                              collateralAsset?.symbol === asset.symbol ? "border-purple-500/50 glow-purple bg-purple-500/5" : ""
                            }`}
                            onClick={() => setCollateralAsset(asset)}
                          >
                            {/* First Row - Asset Info and APY */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <img
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg `}
                                  src={asset.icon}
                                >
                                  {/* {asset.icon} */}
                                </img>
                                <div>
                                  <div className="font-semibold text-white text-sm flex items-center">
                                    {asset.symbol}
                                    {collateralAsset?.symbol === asset.symbol && (
                                      <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400">{asset.name}</div>
                                </div>
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

                          {/* Selected Asset Information */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-white">Selected Collateral Asset</Label>
                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                              {collateralAsset  && (() => {
                                const selectedAsset = collateralAsset
                                return selectedAsset ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <img src={selectedAsset.icon} className="w-10 h-10 rounded-full  flex items-center justify-center text-lg">
                                          {/* {selectedAsset.icon} */}
                                        </img>
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
                                        {
                                          selectedAsset.currentPrice && (<div className="font-semibold text-white text-sm">
                                            ${formatNumber(selectedAsset.currentPrice)}
                                          </div>)
                                        }
                                      </div>
                                    </div>

                                    {/* <div className="bg-slate-800/50 rounded-lg p-3 flex flex-row gap-2 items-center">
                                      <div className="text-xs text-slate-400 ">Yield Strategy:</div>
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
                                    </div> */}
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
                                {collateralAsset?.symbol}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">Balance: 0 {collateralAsset?.symbol} (~$0.00)</div>
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
                              <Slider value={ltv} onValueChange={setLtv} max={maxLtv} min={10} step={5} className="w-full" />
                              <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Conservative (10%)</span>
                                <span>Aggressive ({maxLtv}%)</span>
                              </div>
                            </div>
                          </div>

                          {/* Borrow Asset */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-white">Borrow Asset</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {debtAssets.map((asset) => (
                                <Button
                                  key={asset.symbol}
                                  variant="outline"
                                  className={`token-selector-dark p-2 h-auto flex-col space-y-1 rounded-lg ${
                                    borrowAsset === asset.symbol ? "border-purple-500 bg-purple-500/10 glow-purple" : ""
                                  }`}
                                  onClick={() => setBorrowAsset(asset.symbol)}
                                >
                                  <img src={asset.icon} className="text-base w-8 h-8"></img>
                                  <span className="font-semibold text-white text-xs">{asset.symbol}</span>
                                  <span className="text-xs text-slate-400">{asset.borrowRate}% Interest</span>
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

                              <div className="grid grid-cols-1 gap-2">
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                  <div className="text-xs text-slate-400">Interest Rate</div>
                                  <div className="text-base font-bold text-green-400">0%</div>
                                </div>
                                {/* <div className="bg-slate-800/50 rounded-lg p-2">
                                  <div className="text-xs text-slate-400">Collateral APY</div>
                                  <div className="text-base font-bold text-white">
                                    {collateralAssets.find((a) => a.symbol === collateralAsset)?.apy || "0%"}
                                  </div>
                                </div> */}
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
                              Supply & Borrow
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
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
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Collateral Balance</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Collateral Balance USD</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Max LTV</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Liquidation Threshold</th>
                          {/* <th className="text-right text-xs font-medium text-slate-400 pb-3">Liquidation Penalty</th> */}
                          {/* <th className="text-right text-xs font-medium text-slate-400 pb-3">Borrow Power</th> */}
                          {/* <th className="text-right text-xs font-medium text-slate-400 pb-3">Current Utilization</th> */}
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
                            {/* <td className="text-right py-4">
                              <div className="font-semibold text-white text-sm">{position.netBase}</div>
                              <div className="text-xs text-slate-400">Net {position.symbol}</div>
                            </td> */}
                            <td className="text-right py-4">
                              <div className="font-semibold  text-sm">{position.ltv}%</div>
                            </td>
                                                      <td className="text-right py-4">
                                                        <div className="font-semibold text-yellow-400 text-sm">{position.liquidationThreshold}%</div>
                                                        <div className="text-xs text-red-400">{40.0}% penalty</div>
                                                      </td>
                                                      {/* <td className="text-right py-4">
                                                        <div className="font-semibold text-green-400 text-sm">{position.netBorrow}</div>
                                                        <div className="text-xs text-slate-400">{position.interestRate}% APR</div>
                                                      </td>
                            <td className="text-right py-4">
                              <div className="font-semibold text-green-400 text-sm">{position.currentRate}%</div>
                              <div className="text-xs text-slate-400">{position.baseRate}% base</div>
                            </td> */}
                            {/* <td className="text-right py-4">
                              <div className="font-semibold text-cyan-400 text-sm">{position.currentUtilization}%</div>
                            </td> */}
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

              <Card className="card-dark rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-white">Your Debt Positions</CardTitle>
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
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Borrow Balance</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Borrow Balance USD</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Borrow Rate</th>
                          <th className="text-right text-xs font-medium text-slate-400 pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDebtPositions.map((position, index) => (
                          <tr key={index} className="border-b border-slate-800/50">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <img src={position.icon} className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                                  {/* {position.icon} */}
                                </img>
                                <div>
                                  <div className="font-semibold text-white text-sm">{position.symbol}</div>
                                  <div className="text-xs text-slate-400">{position.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-semibold text-white text-sm">{position.borrowBalance}</div>
                              <div className="text-xs text-slate-400">{position.symbol}</div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-semibold text-white text-sm">${position.borrowBalanceUSD}</div>
                            </td>
                            <td className="text-right py-4">
                              <div className="font-semibold text-cyan-400 text-sm">{position.borrowRate}%</div>
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
    )
  }