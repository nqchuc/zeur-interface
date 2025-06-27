"use client"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  DollarSign,
  ChevronRight,
  Star,
  ExternalLink,
  TrendingUp,
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
import { userCollateralPositions } from "@/lib/constants"
import { formatNumber, formatPercentage } from "@/lib/helper"
import { useSupply } from "@/hooks/contexts/SupplyHookContext"
import { FormattedCollateralData, useBorrow } from "@/hooks/contexts/BorrowHookContext"
import { useTokenBalance, getMaxSupplyAmount, isNativeToken } from "@/hooks/useTokenBalance"
import { useToast } from "@/hooks/useToast"
import { formatUnits } from "viem"
import WithdrawModal from "@/components/modal/WithdrawModal"
import RepayModal from "@/components/modal/RepayModal"

export default function BorrowPage() {
  const [activeTab, setActiveTab] = useState("supply") // "supply" or "borrow"
  const [collateralAsset, setCollateralAsset] = useState<FormattedCollateralData|null>(null)
  const [borrowAsset, setBorrowAsset] = useState("EURC")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [maxLtv, setMaxLtv] = useState(0.0);
  const [ltv, setLtv] = useState([0])
  const { toast } = useToast()
  
  // withdraw dialog
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [selectedWithdrawPosition, setSelectedWithdrawPosition] = useState<any>(null)

  // repay dialog
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false)
  const [selectedRepayPosition, setSelectedRepayPosition] = useState<any>(null)

  // Get user's collateral token balance for the selected asset
  const {
    balanceFormatted: collateralBalanceFormatted,
    balanceNumber: collateralBalanceNumber,
    isLoading: isCollateralBalanceLoading,
    refetch: refetchCollateralBalance
  } = useTokenBalance(
    collateralAsset?.asset,
    collateralAsset?.decimals || 18
  )

  //Hook
  const {debtAssets} = useSupply();
  const {
    collateralAssets,
    userData,
    userBorrowPositions,
    userCollateralPositions,
    supplyCollateral,
    borrow,
    transactionState,
    resetTransaction,
    refetchAssets,
    refetchUserData
  } = useBorrow();

  // Get user's current borrow balance for selected borrow asset
  const currentBorrowBalance = userData && userData.availableBorrowsValue ? (Number((formatUnits(userData.availableBorrowsValue, 8))) / 1.17 ).toFixed(2) : "0"

  // Calculate LTV from borrow amount (simplified)
  const calculateLtvFromBorrowAmount = (borrowAmt: string) => {
    
    const borrowValue = Number.parseFloat(borrowAmt)
    const calculatedLtv = (borrowValue / Number(currentBorrowBalance)) * 100


    
    return Math.min(Math.max(calculatedLtv, 0), maxLtv) // Clamp between 0 and maxLtv
  }

  // Calculate borrow amount from LTV (simplified)
  const calculateBorrowAmountFromLtv = (ltvValue = ltv[0]) => {
    if ( !ltvValue) return "0"
    

    // Simple calculation: LTV% of collateral value = borrow amount
    const borrowAmount = (Number(currentBorrowBalance) * ltvValue / maxLtv)
    return borrowAmount > 0 ? borrowAmount.toFixed(2) : "0"
  }

  // Handle max button click for collateral
  const handleMaxCollateralClick = () => {
    if (collateralAsset && collateralBalanceNumber > 0) {
      const maxAmount = getMaxSupplyAmount(collateralBalanceNumber, collateralAsset.asset)
      setCollateralAmount(maxAmount)
    }
  }

  // Handle max button click for borrow
  const handleMaxBorrowClick = () => {
    // Set LTV to maximum and calculate borrow amount
    setLtv([maxLtv])
    let maxBorrowAmount = Number(currentBorrowBalance).toFixed(2)
    setBorrowAmount(maxBorrowAmount)
  }

  // Handle borrow amount change - update LTV accordingly
  const handleBorrowAmountChange = (value: string) => {
    setBorrowAmount(value)
    
    // Calculate and update LTV based on new borrow amount
    if (value && collateralAmount && collateralAsset) {
      const newLtv = calculateLtvFromBorrowAmount(value)
      setLtv([Math.round(newLtv)])
    } else if (!value) {
      setLtv([0])
    }
  }

  // Handle LTV slider change - update borrow amount accordingly
  const handleLtvChange = (newLtv: number[]) => {
    setLtv(newLtv)
    
    // Calculate and update borrow amount based on new LTV
    const newBorrowAmount = calculateBorrowAmountFromLtv(newLtv[0])
    setBorrowAmount(newBorrowAmount)
  }

  const calculateHealthFactor = () => {
    const currentLtv = ltv[0]
    if (currentLtv < 50) return { value: 2.5, status: "Excellent", color: "text-green-400" }
    if (currentLtv < 70) return { value: 1.8, status: "Good", color: "text-blue-400" }
    if (currentLtv < 80) return { value: 1.2, status: "Moderate", color: "text-yellow-400" }
    return { value: 1.0, status: "Risky", color: "text-red-400" }
  }

  // Update borrow amount when collateral amount or asset changes (but not LTV to avoid conflicts)
  useEffect(() => {
    if (collateralAmount && collateralAsset && ltv[0] > 0) {
      const newBorrowAmount = calculateBorrowAmountFromLtv(ltv[0])
      setBorrowAmount(newBorrowAmount)
    } else if (!collateralAmount) {
      setBorrowAmount("0")
      setLtv([0])
    }
  }, [collateralAmount, collateralAsset]) // Removed ltv dependency to prevent conflicts

  const healthFactor = calculateHealthFactor()
  
  useEffect(() => {
    if(collateralAssets[0]){
      setCollateralAsset(collateralAssets[0])
    }
  }, [collateralAssets])

  useEffect(() => {
    setMaxLtv(Number(collateralAsset?.ltv))
  }, [collateralAsset])

  // Handle supply collateral submission
  const handleSupplyCollateral = async () => {
    if (!collateralAmount) {
      toast({
        variant: "destructive",
        title: "⚠️ Amount Required",
        description: `Please enter the amount of ${collateralAsset?.symbol} you want to supply`,
      })
      return
    }

    const numericAmount = parseFloat(collateralAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid number greater than 0",
      })
      return
    }

    if (numericAmount > collateralBalanceNumber) {
      toast({
        variant: "destructive",
        title: "⚠️ Insufficient Balance",
        description: `You only have ${collateralBalanceFormatted} ${collateralAsset?.symbol} available`,
      })
      return
    }

    try {
      toast({
        title: "🚀 Starting Collateral Supply Process",
        description: `Supplying ${collateralAmount} ${collateralAsset?.symbol} as collateral`,
      })

      // Check if this is a native token
      const isNative = isNativeToken(collateralAsset!.asset)

      await supplyCollateral({
        asset: collateralAsset!.asset,
        amount: collateralAmount,
        symbol: collateralAsset!.symbol,
        decimals: collateralAsset!.decimals,
        isNativeToken: isNative
      })
    } catch (error) {
      console.error('Supply collateral error:', error)
    }
  }

  // Handle borrow submission
  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Invalid Borrow Amount",
        description: "Please enter a valid borrow amount",
      })
      return
    }

    const selectedDebtAsset = debtAssets.find(asset => asset.symbol === borrowAsset)
    if (!selectedDebtAsset) {
      toast({
        variant: "destructive",
        title: "⚠️ Asset Not Found",
        description: "Selected borrow asset not found",
      })
      return
    }

    try {
      toast({
        title: "🚀 Starting Borrow Process",
        description: `Borrowing ${borrowAmount} ${borrowAsset}`,
      })

      await borrow({
        asset: selectedDebtAsset.asset,
        amount: borrowAmount,
        symbol: selectedDebtAsset.symbol,
        decimals: selectedDebtAsset.decimals,
      })
    } catch (error) {
      console.error('Borrow error:', error)
    }
  }

  // Enhanced success handling
  useEffect(() => {
    if (transactionState.isCompleted) {
      if (transactionState.transactionType === 'supply') {
        setCollateralAmount('')
        refetchAssets()
        refetchCollateralBalance()
        resetTransaction()
        toast({
          title: "🎉 Collateral Supply Successful",
          variant: "success",
          description: `Successfully supplied ${transactionState.metadata?.amount} ${transactionState.metadata?.asset} as collateral`,
        })
      } else if (transactionState.transactionType === 'borrow') {
        setBorrowAmount('')
        refetchAssets()
        refetchUserData()
        resetTransaction()
        toast({
          title: "🎉 Borrow Successful",
          variant: "success",
          description: `Successfully borrowed ${transactionState.metadata?.amount} ${transactionState.metadata?.asset}`,
        })
      }
    }
  }, [transactionState.isCompleted, transactionState, refetchAssets, refetchCollateralBalance, refetchUserData, resetTransaction])


  const handleWithdrawClick = (position: any) => {
    setSelectedWithdrawPosition(position)
    setIsWithdrawDialogOpen(true)
  } 

  const handleRepayClick = (position: any) => {
    setSelectedRepayPosition(position)
    setIsRepayDialogOpen(true)
  }

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
                  <CardContent className="p-4 h-fit md:h-[450px] overflow-y-auto scrollbar-hide">
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
                                </div>
                              ) : null
                            })()}
                          </div>
                        </div>

                        {/* Tabs for Supply Collateral vs Borrow */}
                        <div className="space-y-3">
                          <Tabs value={activeTab} onValueChange={setActiveTab}>

                            
                            <TabsContent value="supply" className="space-y-3">
                              {/* Collateral Amount Input */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="collateral-amount" className="text-sm font-semibold text-white">
                                    Collateral Amount
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-400">
                                      Balance: {isCollateralBalanceLoading ? (
                                        <span className="animate-pulse">Loading...</span>
                                      ) : (
                                        <span className="text-slate-300">{collateralBalanceFormatted} {collateralAsset?.symbol}</span>
                                      )}
                                    </span>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                      onClick={handleMaxCollateralClick}
                                      disabled={isCollateralBalanceLoading || collateralBalanceNumber <= 0}
                                    >
                                      Max
                                    </Button>
                                  </div>
                                </div>
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
                                {/* Balance validation warning */}
                                {collateralAmount && parseFloat(collateralAmount) > collateralBalanceNumber && (
                                  <div className="text-xs text-red-400 flex items-center space-x-1">
                                    <span>⚠️</span>
                                    <span>Insufficient balance. You have {collateralBalanceFormatted} {collateralAsset?.symbol}</span>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="borrow" className="space-y-3">
                              {/* Borrow Amount Input */}
                              <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="borrow-amount" className="text-sm font-semibold text-white">
                                      Borrow Amount
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-slate-400">
                                        Current: <span className="text-slate-300">{currentBorrowBalance} {borrowAsset}</span>
                                      </span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                        onClick={handleMaxBorrowClick}
                                      >
                                        Max
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <Input
                                      id="borrow-amount"
                                      type="number"
                                      placeholder="0.0"
                                      value={borrowAmount}
                                      onChange={(e) => handleBorrowAmountChange(e.target.value)}
                                      className="input-dark text-base py-3 pr-16 rounded-lg placeholder:text-slate-500"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold text-sm">
                                      {borrowAsset}
                                    </div>
                                  </div>
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
                                  <Slider 
                                    value={ltv} 
                                    onValueChange={handleLtvChange} 
                                    max={maxLtv} 
                                    min={10} 
                                    step={5} 
                                    className="w-full" 
                                  />
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
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>

                      {/* Right Column - Loan Preview */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                          {/* Tabs at the top */}
                          <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-3">
                              <TabsTrigger value="supply" className="text-white data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                                Supply Collateral
                              </TabsTrigger>
                              <TabsTrigger value="borrow" className="text-white data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                                Borrow
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="supply">
                              <h3 className="text-sm font-semibold text-white mb-3">Collateral Preview</h3>
                              
                              <div className="space-y-3">
                                {/* Supply Preview */}
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                  <div className="text-xs text-slate-400 mb-1">You'll Supply</div>
                                  <div className="text-lg font-bold text-white">
                                    {collateralAmount || '0'} {collateralAsset?.symbol}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    ≈ ${((parseFloat(collateralAmount) || 0) * (collateralAsset?.currentPrice || 0)).toFixed(2)} USD
                                  </div>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-2">
                                  <div className="text-xs text-slate-400">Interest Rate</div>
                                  <div className="text-base font-bold text-green-400">0%</div>
                                </div>

                                {/* Action Button */}
                                <Button
                                  size="lg"
                                  onClick={handleSupplyCollateral}
                                  disabled={
                                    transactionState.currentStep !== 'idle' ||
                                    (!collateralAmount || parseFloat(collateralAmount) <= 0 || parseFloat(collateralAmount) > collateralBalanceNumber)
                                  }
                                  className="w-full btn-primary-purple rounded-lg py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Supply Collateral
                                  <TrendingUp className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="borrow">
                              <h3 className="text-sm font-semibold text-white mb-3">Loan Preview</h3>
                              
                              <div className="space-y-3">
                                {/* Borrow Preview */}
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                  <div className="text-xs text-slate-400 mb-1">You'll Receive</div>
                                  <div className="text-lg font-bold text-white">
                                    {borrowAmount || '0'} {borrowAsset}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">≈ ${borrowAmount || '0'} USD</div>
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-2">
                                  <div className="text-xs text-slate-400">Interest Rate</div>
                                  <div className="text-base font-bold text-green-400">0%</div>
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

                                {/* Action Button */}
                                <Button
                                  size="lg"
                                  onClick={handleBorrow}
                                  disabled={
                                    transactionState.currentStep !== 'idle' ||
                                    (!borrowAmount || parseFloat(borrowAmount) <= 0)
                                  }
                                  className="w-full btn-primary-purple rounded-lg py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Borrow
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
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
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCollateralPositions.map((position, index) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={position.icon} className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                              </img>
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
                            <div className="font-semibold text-sm">{position.ltv}%</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-yellow-400 text-sm">{position.liquidationThreshold}%</div>
                            <div className="text-xs text-red-400">40.0% penalty</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" onClick={() => handleWithdrawClick(position)} variant="outline" className="text-xs h-7 px-2">
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

            <WithdrawModal
                          isOpen={isWithdrawDialogOpen}
                          onClose={() => {
                            setIsWithdrawDialogOpen(false)
                            setSelectedWithdrawPosition(null)
                          }}
                          selectedPosition={selectedWithdrawPosition}
                          refetchBalance = {refetchCollateralBalance}
                          isCollateral
                        />

              <RepayModal isOpen={isRepayDialogOpen}
                          onClose={() => {
                            setIsRepayDialogOpen(false)
                            setSelectedRepayPosition(null)
                          }}
                          selectedPosition={selectedRepayPosition}
                          refetchBalance = {refetchAssets}
                        />

            {/* User Debt Positions Table */}
            <Card className="card-dark rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">Your Debt Positions</CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {userBorrowPositions.length} Active
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
                      {userBorrowPositions.map((position, index) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={position.icon} className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
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
                              <Button onClick={() => handleRepayClick(position)} size="sm" variant="outline" className="text-xs h-7 px-2">
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