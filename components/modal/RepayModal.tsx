"use client"
import React, { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { useSupply } from "@/hooks/contexts/SupplyHookContext"
import { FormattedAssetData, FormattedUserDebtData } from "@/types/contracts"
import { useTransactions } from "@/hooks/useTransactions"
import { FormattedUserBorrowData, FormattedUserCollateralData, useBorrow } from "@/hooks/contexts/BorrowHookContext"

interface RepayModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPosition: FormattedUserBorrowData
  refetchBalance: () => void
}

export default function RepayModal({ 
  isOpen, 
  onClose, 
  selectedPosition,
  refetchBalance ,
}: RepayModalProps) {
  const [repayAmount, setRepayAmount] = useState("")
  const { toast } = useToast()
  
  // Use the supply context which now includes Repay functionality
//   const {
//     Repay,
//     transactionState,
//     resetTransaction,
//     refetchAssets
//   } = useSupply()
  const {
    repay,
    transactionState,
    resetTransaction,
    refetchAssets,
  } = useBorrow();


  // Handle Repay submission
  const handleRepay = async () => {
    if (!repayAmount) {
      toast({
        variant: "destructive",
        title: "⚠️ Amount Required",
        description: `Please enter the amount of ${selectedPosition?.symbol} you want to Repay`,
      })
      return
    }

    const numericAmount = parseFloat(repayAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid number greater than 0",
      })
      return
    }

    const maxRepay = parseFloat(selectedPosition?.borrowBalance || "0")
    if (numericAmount > maxRepay) {
      toast({
        variant: "destructive",
        title: "⚠️ Insufficient Balance",
        description: `You can only Repay up to ${maxRepay} ${selectedPosition?.symbol}`,
      })
      return
    }

    try {
      // Show initial toast to indicate process has started
      toast({
        title: "🚀 Starting Repay Process",
        description: `Repaying ${repayAmount} ${selectedPosition?.symbol} from the pool`,
      })

      // Execute Repay transaction using context
      await repay({
          asset: selectedPosition.debtAsset,
          amount: repayAmount,
          decimals: selectedPosition.decimals,
          symbol: selectedPosition.symbol
        });

    } catch (error) {
      console.error('Repay error:', error)
      toast({
        variant: "destructive",
        title: "❌ Repay Failed",
        description: `Failed to Repay ${selectedPosition?.symbol}`,
      })
    }
  }

  // Handle transaction completion - close modal when Repay completes
  useEffect(() => {
    if (transactionState.isCompleted && transactionState.transactionType === "repay") {
      toast({
        title: "🎉 Repay Successful",
        variant: "success",
        description: `Successfully Repay ${transactionState.metadata?.amount} ${transactionState.metadata?.asset} from the pool`,
      })
      refetchAssets()
      resetTransaction()
      refetchBalance()
      onClose()
      setRepayAmount("")
    }

    if (transactionState.isCompleted && transactionState.transactionType === "repay" && transactionState.error) {
      toast({
        variant: "destructive",
        title: "❌ Repay Failed",
        description: transactionState.error,
      })
    }

  }, [transactionState.isCompleted, transactionState.currentStep, onClose])

  // Handle transaction errors
  useEffect(() => {
    if (transactionState.error && transactionState.transactionType === "repay") {
      toast({
        variant: "destructive",
        title: "❌ Repay Failed",
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
              <span>Repay {selectedPosition?.symbol}</span>
            </h2>
            <p className="text-sm text-slate-300">
              Enter the amount you want to Repay from your supply position.
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
                  <div className="text-slate-400">Debt Balance</div>
                  <div className="font-semibold text-white">
                    {selectedPosition.borrowBalance} {selectedPosition.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">USD Value</div>
                  <div className="font-semibold text-white">
                    ${selectedPosition.currentPrice ? (Number(selectedPosition.borrowBalance) * selectedPosition.currentPrice).toFixed(2) : "0.0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="Repay-amount" className="text-sm font-semibold text-white">
              Repay Amount
            </Label>
            <div className="relative">
              <Input
                id="Repay-amount"
                type="number"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="input-dark text-base py-3 pr-16 rounded-lg placeholder:text-slate-500 bg-slate-800 border-slate-600 text-white"
                disabled={transactionState.isProcessing && transactionState.transactionType === "repay"}
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
                    disabled={transactionState.isProcessing && transactionState.transactionType === "repay"}
                    onClick={() => {
                      const maxAmount = parseFloat(selectedPosition?.borrowBalance || "0");
                      setRepayAmount((maxAmount * multiplier).toString());
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
              disabled={transactionState.isProcessing && transactionState.transactionType === "repay"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRepay}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              disabled={!repayAmount || parseFloat(repayAmount) <= 0 || (transactionState.isProcessing && transactionState.transactionType === "repay")}
            >
              {transactionState.isProcessing && transactionState.transactionType === "repay" ? transactionState.statusMessage : 'repay'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

