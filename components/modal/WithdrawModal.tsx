"use client"
import React, { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { useSupply } from "@/hooks/contexts/SupplyHookContext"
import { FormattedUserDebtData } from "@/types/contracts"
import { useTransactions } from "@/hooks/useTransactions"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPosition: FormattedUserDebtData
  refetchBalance: () => void
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  selectedPosition,
  refetchBalance 
}: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const { toast } = useToast()
  
  // Use the supply context which now includes withdraw functionality
  const {
    withdraw,
    transactionState,
    resetTransaction,
    refetchAssets
  } = useSupply()


  // Handle withdraw submission
  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      toast({
        variant: "destructive",
        title: "⚠️ Amount Required",
        description: `Please enter the amount of ${selectedPosition?.symbol} you want to withdraw`,
      })
      return
    }

    const numericAmount = parseFloat(withdrawAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid number greater than 0",
      })
      return
    }

    const maxWithdraw = parseFloat(selectedPosition?.supplyBalance || "0")
    if (numericAmount > maxWithdraw) {
      toast({
        variant: "destructive",
        title: "⚠️ Insufficient Balance",
        description: `You can only withdraw up to ${maxWithdraw} ${selectedPosition?.symbol}`,
      })
      return
    }

    try {
      // Show initial toast to indicate process has started
      toast({
        title: "🚀 Starting Withdraw Process",
        description: `Withdrawing ${withdrawAmount} ${selectedPosition?.symbol} from the pool`,
      })

      // Execute withdraw transaction using context
      await withdraw({
        asset: selectedPosition.debtAsset,
        amount: withdrawAmount,
        decimals: selectedPosition.decimals,
      })

    } catch (error) {
      console.error('Withdraw error:', error)
      toast({
        variant: "destructive",
        title: "❌ Withdraw Failed",
        description: `Failed to withdraw ${selectedPosition?.symbol}`,
      })
    }
  }

  // Handle transaction completion - close modal when withdraw completes
  useEffect(() => {
    if (transactionState.isCompleted && transactionState.transactionType === "withdraw") {
      toast({
        title: "🎉 Withdrawal Successful",
        variant: "success",
        description: `Successfully withdraw ${transactionState.metadata?.amount} ${transactionState.metadata?.asset} from the pool`,
      })
      refetchAssets()
      resetTransaction()
      refetchBalance()
      onClose()
      setWithdrawAmount("")
    }
  }, [transactionState.isCompleted, onClose])

  // Handle transaction errors
  useEffect(() => {
    if (transactionState.error && transactionState.transactionType === "withdraw") {
      toast({
        variant: "destructive",
        title: "❌ Withdraw Failed",
        description: transactionState.error,
      })
    }
  }, [transactionState.error, toast])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-slate-400 hover:text-white z-10"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-white flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              <span>Withdraw {selectedPosition?.symbol}</span>
            </h2>
            <p className="text-sm text-slate-300">
              Enter the amount you want to withdraw from your supply position.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4 py-4">
          {/* Asset Information */}
          {selectedPosition && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src={selectedPosition.icon} 
                  className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/50"
                  alt={selectedPosition.symbol}
                />
                <div>
                  <div className="font-semibold text-white">{selectedPosition.symbol}</div>
                  <div className="text-sm text-slate-400">{selectedPosition.name}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Available Balance</div>
                  <div className="font-semibold text-white">
                    {selectedPosition.supplyBalance} {selectedPosition.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">USD Value</div>
                  <div className="font-semibold text-white">
                    ${(Number(selectedPosition.supplyBalance) * 1.17).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-sm font-semibold text-white">
              Withdraw Amount
            </Label>
            <div className="relative">
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="input-dark text-base py-3 pr-16 rounded-lg placeholder:text-slate-500 bg-slate-800 border-slate-600 text-white"
                disabled={transactionState.isProcessing && transactionState.transactionType === "withdraw"}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-sm text-slate-400">
                  {selectedPosition?.symbol}
                </span>
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              {["25%", "50%", "75%", "Max"].map((percentage, index) => {
                const multiplier = percentage === "Max" ? 1 : parseFloat(percentage) / 100;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    disabled={transactionState.isProcessing && transactionState.transactionType === "withdraw"}
                    onClick={() => {
                      const maxAmount = parseFloat(selectedPosition?.supplyBalance || "0");
                      setWithdrawAmount((maxAmount * multiplier).toString());
                    }}
                  >
                    {percentage}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              disabled={transactionState.isProcessing && transactionState.transactionType === "withdraw"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || (transactionState.isProcessing && transactionState.transactionType === "withdraw")}
            >
              {transactionState.isProcessing && transactionState.transactionType === "withdraw" ? transactionState.statusMessage : 'Withdraw'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

