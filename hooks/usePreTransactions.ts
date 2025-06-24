import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useEstimateGas, useGasPrice } from 'wagmi'
import { Address, formatEther, formatGwei, maxUint256 } from 'viem'
import { erc20Abi } from 'viem'

interface PreTransactionParams {
  // Contract interaction params
  contractAddress: Address
  contractAbi: any
  functionName: string
  args?: any[]
  value?: bigint
  
  // Token approval params (optional)
  tokenAddress?: Address // If provided, will handle approval
  tokenAmount?: bigint   // Amount to approve
  spenderAddress?: Address // Usually the contract address
  
  // Skip approval for native tokens
  skipApproval?: boolean
}

type PreTransactionStep = 'idle' | 'checking-allowance' | 'approving' | 'estimating-gas' | 'ready' | 'error'

interface PreTransactionState {
  currentStep: PreTransactionStep
  isProcessing: boolean
  isReady: boolean
  error: string | null
  
  // Approval state
  currentAllowance: bigint | undefined
  needsApproval: boolean
  approvalTxHash: Address | undefined
  isApproving: boolean
  
  // Gas estimation state
  gasLimit: bigint | undefined
  gasPrice: bigint | undefined
  gasCost: bigint | undefined
  gasCostInEth: string
  gasCostInGwei: string
  isEstimatingGas: boolean
}

export function usePreTransactions() {
  const { address: userAddress } = useAccount()
  const [params, setParams] = useState<PreTransactionParams | null>(null)
  const [currentStep, setCurrentStep] = useState<PreTransactionStep>('idle')
  const [error, setError] = useState<string | null>(null)
  
  // Gas price
  const { data: gasPrice } = useGasPrice()
  
  // Token allowance check
  const { 
    data: currentAllowance, 
    refetch: refetchAllowance 
  } = useReadContract({
    address: params?.tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: params && userAddress && params.spenderAddress ? 
      [userAddress, params.spenderAddress] : undefined,
    query: {
      enabled: !!params?.tokenAddress && !params.skipApproval && !!userAddress && !!params.spenderAddress,
    }
  })
  
  // Gas estimation
  const { 
    data: gasLimit, 
    isLoading: isEstimatingGas 
  } = useEstimateGas({
    // address: params?.contractAddress,
    // abi: params?.contractAbi,
    // functionName: params?.functionName,
    // args: params?.args,
    // account: userAddress,
    // value: params?.value,
    query: {
      enabled: currentStep === 'estimating-gas' && !!params && !!userAddress,
    }
  })
  
  // Approval transaction
  const {
    writeContract: writeApproval,
    data: approvalTxHash,
    isPending: isApprovingPending,
    error: approvalError
  } = useWriteContract()
  
  // Wait for approval confirmation
  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalConfirmed
  } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  
  // Check if approval is needed
  const needsApproval = useCallback(() => {
    if (!params?.tokenAddress || params.skipApproval || !currentAllowance || !params.tokenAmount) return false
    return currentAllowance < params.tokenAmount
  }, [params, currentAllowance])
  
  // Handle approval step
  useEffect(() => {
    if (currentStep === 'checking-allowance' && params) {
      if (params.skipApproval || !params.tokenAddress) {
        console.log('⏭️ Skipping approval (native token or no token specified)')
        setCurrentStep('estimating-gas')
      } else if (currentAllowance !== undefined) {
        if (needsApproval()) {
          console.log('🔐 Approval needed, starting approval transaction')
          setCurrentStep('approving')
          
          if (!params.spenderAddress) {
            setError('Spender address is required for token approval')
            setCurrentStep('error')
            return
          }
          
          writeApproval({
            address: params.tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [params.spenderAddress, maxUint256],
          })
        } else {
          console.log('✅ Sufficient allowance, proceeding to gas estimation')
          setCurrentStep('estimating-gas')
        }
      }
    }
  }, [currentStep, params, currentAllowance, needsApproval, writeApproval])
  
  // Handle approval confirmation
  useEffect(() => {
    if (currentStep === 'approving' && isApprovalConfirmed) {
      console.log('✅ Approval confirmed, proceeding to gas estimation')
      refetchAllowance()
      setCurrentStep('estimating-gas')
    }
  }, [currentStep, isApprovalConfirmed, refetchAllowance])
  
  // Handle gas estimation completion
  useEffect(() => {
    if (currentStep === 'estimating-gas' && !isEstimatingGas && gasLimit) {
      console.log('⛽ Gas estimated:', gasLimit.toString())
      setCurrentStep('ready')
    }
  }, [currentStep, isEstimatingGas, gasLimit])
  
  // Handle errors
  useEffect(() => {
    if (approvalError) {
      setError(`Approval failed: ${approvalError.message}`)
      setCurrentStep('error')
    }
  }, [approvalError])
  
  // Main prepare function
  const prepare = useCallback(async (transactionParams: PreTransactionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log('🚀 Starting pre-transaction preparation:', {
      contract: transactionParams.contractAddress,
      function: transactionParams.functionName,
      tokenAddress: transactionParams.tokenAddress,
      skipApproval: transactionParams.skipApproval,
    })
    
    setParams(transactionParams)
    setCurrentStep('checking-allowance')
    setError(null)
  }, [userAddress])
  
  // Reset function
  const reset = useCallback(() => {
    setCurrentStep('idle')
    setParams(null)
    setError(null)
  }, [])
  
  // Calculate gas cost
  const gasCost = gasLimit && gasPrice ? gasLimit * gasPrice : undefined
  const gasCostInEth = gasCost ? formatEther(gasCost) : '0'
  const gasCostInGwei = gasPrice ? formatGwei(gasPrice) : '0'
  
  // Get current status message
  const getStatusMessage = () => {
    switch (currentStep) {
      case 'idle':
        return 'Ready to prepare transaction'
      case 'checking-allowance':
        return 'Checking token allowance...'
      case 'approving':
        return isApprovingPending ? 'Confirming approval...' : 
               isApprovalConfirming ? 'Waiting for approval confirmation...' : 
               'Requesting token approval...'
      case 'estimating-gas':
        return 'Estimating gas costs...'
      case 'ready':
        return 'Ready to execute transaction'
      case 'error':
        return 'Error occurred during preparation'
      default:
        return 'Unknown status'
    }
  }
  
  // Return state and functions
  const state: PreTransactionState = {
    currentStep,
    isProcessing: currentStep !== 'idle' && currentStep !== 'ready' && currentStep !== 'error',
    isReady: currentStep === 'ready',
    error,
    
    // Approval state
    currentAllowance,
    needsApproval: needsApproval(),
    approvalTxHash,
    isApproving: currentStep === 'approving',
    
    // Gas estimation state
    gasLimit,
    gasPrice,
    gasCost,
    gasCostInEth,
    gasCostInGwei,
    isEstimatingGas: currentStep === 'estimating-gas',
  }
  
  return {
    // Main functions
    prepare,
    reset,
    
    // State
    ...state,
    
    // Helper
    statusMessage: getStatusMessage(),
    
    // For use in actual transaction
    preparedParams: params,
    estimatedGasLimit: gasLimit,
  }
}

// Helper hook for common ERC20 operations
export function useERC20PreTransactions(contractAddress: Address, contractAbi: any) {
  const preTransactions = usePreTransactions()
  
  const prepareERC20Transaction = useCallback(async (
    functionName: string,
    args: any[],
    tokenAddress: Address,
    tokenAmount: bigint,
    value?: bigint
  ) => {
    return preTransactions.prepare({
      contractAddress,
      contractAbi,
      functionName,
      args,
      value,
      tokenAddress,
      tokenAmount,
      spenderAddress: contractAddress, // Usually approve the contract itself
      skipApproval: false,
    })
  }, [preTransactions, contractAddress, contractAbi])
  
  const prepareNativeTransaction = useCallback(async (
    functionName: string,
    args: any[],
    value?: bigint
  ) => {
    return preTransactions.prepare({
      contractAddress,
      contractAbi,
      functionName,
      args,
      value,
      skipApproval: true, // No approval needed for native tokens
    })
  }, [preTransactions, contractAddress, contractAbi])
  
  return {
    ...preTransactions,
    prepareERC20Transaction,
    prepareNativeTransaction,
  }
}