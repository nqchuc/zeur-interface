import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, maxUint256 } from 'viem'
import { erc20Abi } from 'viem'

interface WriteContractParams {
  address: Address
  abi: any
  functionName: string
  args?: readonly any[] // Keep optional but use readonly any[]
  value?: bigint
}

interface ApprovalParams {
  tokenAddress: Address
  tokenAmount: bigint
  spenderAddress: Address
}

interface TransactionRequest {
  writeContract: WriteContractParams
  approval?: ApprovalParams // Optional - if provided, will handle approval first
}

type TransactionStep = 'idle' | 'checking-approval' | 'approving' | 'executing' | 'confirming' | 'completed' | 'error'

interface TransactionState {
  currentStep: TransactionStep
  isProcessing: boolean
  isCompleted: boolean
  error: string | null
  
  // Approval state
  currentAllowance?: bigint
  needsApproval: boolean
  approvalTxHash?: Address
  
  // Main transaction state  
  txHash?: Address
  
  // Status helpers
  statusMessage: string
}

export function useTransactions() {
  const { address: userAddress } = useAccount()
  const [currentStep, setCurrentStep] = useState<TransactionStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest | null>(null)
  
  // Token allowance check (only when approval is needed)
  const { 
    data: currentAllowance, 
    refetch: refetchAllowance 
  } = useReadContract({
    address: transactionRequest?.approval?.tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: transactionRequest?.approval && userAddress ? 
      [userAddress, transactionRequest.approval.spenderAddress] : undefined,
    query: {
      enabled: !!transactionRequest?.approval && !!userAddress,
    }
  })
  
  // Approval transaction
  const {
    writeContract: writeApproval,
    data: approvalTxHash,
    isPending: isApprovingPending,
    error: approvalError,
    reset: resetApproval
  } = useWriteContract()
  
  // Approval confirmation
  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalConfirmed
  } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  
  // Main transaction
  const {
    writeContract: writeMainTransaction,
    data: txHash,
    isPending: isTransactionPending,
    error: transactionError,
    reset: resetTransaction
  } = useWriteContract()
  
  // Main transaction confirmation
  const {
    isLoading: isTransactionConfirming,
    isSuccess: isTransactionConfirmed
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  // Check if approval is needed
  const needsApproval = useCallback((): boolean => {
    if (!transactionRequest?.approval || !currentAllowance) return false
    return currentAllowance < transactionRequest.approval.tokenAmount
  }, [transactionRequest, currentAllowance])
  
  // Handle approval checking step
  useEffect(() => {
    if (currentStep === 'checking-approval' && transactionRequest) {
      // No approval needed
      if (!transactionRequest.approval) {
        console.log('⏭️ No approval needed, executing transaction')
        setCurrentStep('executing')
        return
      }
      
      // Wait for allowance to load
      if (currentAllowance === undefined) {
        console.log('⏳ Loading current allowance...')
        return
      }
      
      // Check if approval is needed
      if (!needsApproval()) {
        console.log('✅ Sufficient allowance, executing transaction')
        setCurrentStep('executing')
        return
      }
      
      // Need approval
      console.log('🔐 Approval needed, requesting approval')
      setCurrentStep('approving')
      
      writeApproval({
        address: transactionRequest.approval.tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [transactionRequest.approval.spenderAddress, maxUint256],
      })
    }
  }, [currentStep, transactionRequest, currentAllowance, needsApproval, writeApproval])
  
  // Handle approval confirmation
  useEffect(() => {
    if (currentStep === 'approving' && isApprovalConfirmed) {
      console.log('✅ Approval confirmed, executing transaction')
      refetchAllowance()
      setCurrentStep('executing')
    }
  }, [currentStep, isApprovalConfirmed, refetchAllowance])
  
  // Handle transaction execution
  useEffect(() => {
    if (currentStep === 'executing' && transactionRequest) {
      console.log('🚀 Executing main transaction')
      
      // Ensure args is always an array (wagmi requirement)
      const contractParams = {
        ...transactionRequest.writeContract,
        args: transactionRequest.writeContract.args || [], // Provide default empty array
      }
      
      writeMainTransaction(contractParams)
      setCurrentStep('confirming')
    }
  }, [currentStep, transactionRequest, writeMainTransaction])
  
  // Handle transaction completion
  useEffect(() => {
    if (currentStep === 'confirming' && isTransactionConfirmed) {
      console.log('🎉 Transaction completed successfully!')
      setCurrentStep('completed')
    }
  }, [currentStep, isTransactionConfirmed])
  
  // Handle errors
  useEffect(() => {
    if (approvalError) {
      setError(`Approval failed: ${approvalError.message}`)
      setCurrentStep('error')
    }
    if (transactionError) {
      setError(`Transaction failed: ${transactionError.message}`)
      setCurrentStep('error')
    }
  }, [approvalError, transactionError])
  
  // Main execute function
  const execute = useCallback(async (request: TransactionRequest) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log('🚀 Starting transaction execution', {
      contract: request.writeContract.address,
      function: request.writeContract.functionName,
      needsApproval: !!request.approval,
    })
    
    setTransactionRequest(request)
    setCurrentStep('checking-approval')
    setError(null)
  }, [userAddress])
  
  // Reset function
  const reset = useCallback(() => {
    setCurrentStep('idle')
    setError(null)
    setTransactionRequest(null)
    resetApproval()
    resetTransaction()
  }, [resetApproval, resetTransaction])
  
  // Get status message
  const getStatusMessage = () => {
    switch (currentStep) {
      case 'idle':
        return 'Ready to execute transaction'
      case 'checking-approval':
        return 'Checking token approval...'
      case 'approving':
        return isApprovingPending ? 'Confirming approval...' : 
               isApprovalConfirming ? 'Waiting for approval confirmation...' : 
               'Requesting token approval...'
      case 'executing':
        return 'Preparing transaction...'
      case 'confirming':
        return isTransactionPending ? 'Confirming transaction...' :
               isTransactionConfirming ? 'Waiting for confirmation...' :
               'Processing transaction...'
      case 'completed':
        return 'Transaction completed successfully!'
      case 'error':
        return 'Transaction failed'
      default:
        return 'Unknown status'
    }
  }
  
  // Build transaction state
  const state: TransactionState = {
    currentStep,
    isProcessing: currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error',
    isCompleted: currentStep === 'completed',
    error,
    
    // Approval state
    currentAllowance,
    needsApproval: needsApproval(),
    approvalTxHash,
    
    // Transaction state
    txHash,
    
    // Status
    statusMessage: getStatusMessage(),
  }
  
  return {
    // Main function
    execute,
    reset,
    
    // State
    ...state,
  }
}