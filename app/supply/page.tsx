"use client"
import { useEffect, useState } from "react"
import {
  TrendingUp,
  Wallet,
  CreditCard,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumber, formatPercentage, formatUtilization } from "@/lib/helper"
import { useSupply } from "@/hooks/contexts/SupplyHookContext"
import { FormattedAssetData } from "@/types/contracts"
import { useToast } from "@/hooks/useToast"
import WithdrawModal from "@/components/modal/WithdrawModal"
import { useTokenBalance, getMaxSupplyAmount } from "@/hooks/useTokenBalance"

export default function SupplyPage() {
    const [paymentMethod, setPaymentMethod] = useState("crypto")
    const [amount, setAmount] = useState("0")
    const [selectedLendAsset, setSelectedLendAsset] = useState<FormattedAssetData|null>(null)
    const { toast } = useToast()

    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
    const [selectedWithdrawPosition, setSelectedWithdrawPosition] = useState<any>(null)

    // Get user's token balance for the selected asset
    const {
      balanceFormatted,
      balanceNumber,
      isLoading: isBalanceLoading,
      refetch: refetchBalance
    } = useTokenBalance(
      selectedLendAsset?.asset,
      selectedLendAsset?.decimals || 18
    )

    const {
      supply,
      debtAssets,
      userDebtPositions,
      refetchAssets,
      transactionState,
      resetTransaction
    } = useSupply()

    // Handle max button click
    const handleMaxClick = () => {
      if (selectedLendAsset && balanceNumber > 0) {
        const maxAmount = getMaxSupplyAmount(balanceNumber, selectedLendAsset.asset) // Assuming ERC20 tokens
        setAmount(maxAmount)
      }
    }
  
    // Handle supply submission 
  const handleSupply = async () => {
    if (!amount) {
      toast({
        variant: "destructive",
        title: "⚠️ Amount Required",
        description: `Please enter the amount of ${selectedLendAsset?.symbol} you want to supply`,
      })
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid number greater than 0",
      })
      return
    }

    if (numericAmount > balanceNumber) {
      toast({
        variant: "destructive",
        title: "⚠️ Insufficient Balance",
        description: `You only have ${balanceFormatted} ${selectedLendAsset?.symbol} available`,
      })
      return
    }

    try {
      // Show initial toast to indicate process has started
      toast({
        title: "🚀 Starting Supply Process",
        description: `Supplying ${amount} ${selectedLendAsset?.symbol} to the pool`,
      })

      await supply({
        asset: selectedLendAsset!.asset,
        amount,
        symbol: selectedLendAsset!.symbol,
        decimals: selectedLendAsset!.decimals,
        isNativeToken: false
      })
    } catch (error) {
      console.error('Supply error:', error)
      // Error handling is done in useTransactions hook
    }
  }

  // Enhanced success handling
  useEffect(() => {
    if (transactionState.isCompleted) {
        setAmount('')
      
       if (transactionState.transactionType === 'supply'){
        refetchAssets()
        refetchBalance() // Refresh balance after successful supply
        resetTransaction()
        toast({
          title: "🎉 Supply Successful",
          variant: "success",
          description: `Successfully supplied ${transactionState.metadata?.amount} ${transactionState.metadata?.asset} to the pool`,
        })
      }
    }
  }, [transactionState.isCompleted, transactionState, selectedLendAsset, refetchBalance])

  useEffect(() => {
    if(debtAssets[0]){
      setSelectedLendAsset(debtAssets[0])
    }
  }, [debtAssets])

  const handleWithdrawClick = (position: any) => {
    setSelectedWithdrawPosition(position)
    setIsWithdrawDialogOpen(true)
  } 

  return (
    <div className="space-y-4">
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
            <div className="flex flex-col lg:flex-row gap-6 h-fit">
              {/* Left Column - Available Debt Assets (30%) */}
              <div className="lg:w-[30%] order-1 lg:order-1 h-it">
                <Card className="card-dark rounded-xl overflow-hidden h-fit">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-white">Available Assets</CardTitle>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Earn Yield</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 h-fit md:h-[450px] overflow-y-auto scrollbar-hide">
                    <div className="space-y-2">
                      {debtAssets.map((asset, index) => (
                        <div
                          key={index}
                          className={`card-dark rounded-lg p-3 cursor-pointer transition-all hover:glow-purple ${
                            selectedLendAsset?.symbol === asset.symbol ? "border-blue-500/50 glow-purple bg-blue-500/5" : ""
                          }`}
                          onClick={() => setSelectedLendAsset(asset)}
                        >
                          {/* First Row - Asset Info and APY */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={asset.icon}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                  selectedLendAsset?.symbol === asset.symbol
                                    ? "bg-blue-500/20 border-2 border-blue-500/50"
                                    : ``
                                }`}
                              >
                              </img>
                              <div>
                                <div className="font-semibold text-white text-sm flex items-center">
                                  {asset.symbol}
                                  {selectedLendAsset?.symbol === asset.symbol && (
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
              <div className="lg:w-[70%] order-2 lg:order-2 h-it">
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
                              const selectedAsset = debtAssets.find((a) => a.symbol === selectedLendAsset?.symbol)
                              return selectedAsset ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <img src={selectedAsset.icon} className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center text-lg">
                                        {/* {selectedAsset.icon} */}
                                      </img>
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

                                  {/* Deposit Amount with Balance Display */}
                                  <div className="space-y-2 mt-5">
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="deposit-amount" className="text-sm font-semibold text-white">
                                        Deposit Amount
                                      </Label>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-400">
                                          Balance: {isBalanceLoading ? (
                                            <span className="animate-pulse">Loading...</span>
                                          ) : (
                                            <span className="text-slate-300">{balanceFormatted} {selectedAsset.symbol}</span>
                                          )}
                                        </span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="h-6 px-2 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                          onClick={handleMaxClick}
                                          disabled={isBalanceLoading || balanceNumber <= 0}
                                        >
                                          Max
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        id="deposit-amount"
                                        type="number"
                                        placeholder="0.00"
                                        className="input-dark text-base py-3 rounded-lg placeholder:text-slate-500 pr-16"
                                      />
                                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="text-sm text-slate-400">{selectedAsset.symbol}</span>
                                      </div>
                                    </div>
                                    {/* Balance validation warning */}
                                    {amount && parseFloat(amount) > balanceNumber && (
                                      <div className="text-xs text-red-400 flex items-center space-x-1">
                                        <span>⚠️</span>
                                        <span>Insufficient balance. You have {balanceFormatted} {selectedAsset.symbol}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* <div className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="text-xs text-slate-400 mb-2">Supported Protocols</div>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedAsset.protocols.map((protocol, index) => (
                                        <div key={index} className="bg-slate-700/50 rounded-lg px-2 py-1">
                                          <span className="text-xs text-white">{protocol}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div> */}
                                </div>
                              ) : null
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="md:col-span-5 mt-6">
                      
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                          <h3 className="text-sm font-semibold text-white mb-3">Review Selection</h3>
                            
                          <div className="space-y-3">
                              <Card className="card-dark border-blue-500/20">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-slate-400">Expected APY</span>
                                      <span className="text-base font-bold text-green-400">{Number(selectedLendAsset?.supplyRate) / 100}%</span>
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
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">High yield</Badge>

                                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                        AI strategy engine
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>

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
                              onClick={() => handleSupply()}
                              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balanceNumber || isBalanceLoading || transactionState.currentStep !== 'idle'}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Supply
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

            <WithdrawModal
              isOpen={isWithdrawDialogOpen}
              onClose={() => {
                setIsWithdrawDialogOpen(false)
                setSelectedWithdrawPosition(null)
              }}
              selectedPosition={selectedWithdrawPosition}
              refetchBalance = {refetchBalance}
            />
            


            {/* User Debt Positions Table */}
            <Card className="card-dark rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">Your Supply Positions</CardTitle>
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
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Balance USD</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">APY</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Utilization</th>
                        <th className="text-right text-xs font-medium text-slate-400 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDebtPositions.map((position, index) => (
                        <tr key={index} className="border-b border-slate-800/50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={position.icon} className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
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
                            <div className="font-semibold text-white text-sm">${(Number(position.supplyBalance) * 1.17).toFixed(2)}</div>
                            <div className="text-xs text-slate-400">{position.symbol}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-green-400 text-sm">{formatPercentage(position.supplyRate)}</div>
                          </td>
                          <td className="text-right py-4">
                            <div className="font-semibold text-cyan-400 text-sm">{formatUtilization(position.utilizationRate)}</div>
                          </td>

                          <td className="text-right py-4">
                            <div className="flex justify-end space-x-2">
                              <Button onClick={() => handleWithdrawClick(position)} size="sm" variant="outline" className="text-xs h-7 px-2">
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
  )
}