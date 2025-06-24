import { useState, useCallback, useEffect } from 'react'
import { useEstimateGas, useGasPrice, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, formatGwei, formatEther, maxUint256 } from 'viem'
import { erc20Abi } from 'viem'

interface GasEstimationParams {
  address: Address
  abi: any
  functionName: string
  args?: any[]
  value?: bigint
  account?: Address
}

interface TokenApprovalParams {
  tokenAddress: Address
  spenderAddress: Address
  amount: bigint
  userAddress: Address
}

interface ApprovalState {
  isNeeded: boolean
  isApproving: boolean
  isApproved: boolean
  approvalTxHash: Address | undefined
  approvalError: Error | null
  currentAllowance: bigint | undefined
}

export function useGasEstimation() {
  const [estimationParams, setEstimationParams] = useState<GasEstimationParams | null>(null)
  const [approvalParams, setApprovalParams] = useState<TokenApprovalParams | null>(null)
  const [approvalProcessing, setApprovalProcessing] = useState(false)
  
  // Get current gas price
  const { data: gasPrice } = useGasPrice()
  
  // Estimate gas for the transaction
  const { 
    data: gasLimit, 
    isLoading: isLoadingGas, 
    error: gasError 
  } = useEstimateGas({
    ...estimationParams,
    query: {
      enabled: !!estimationParams,
    }
  })
  
  // Token allowance check
  const { 
    data: currentAllowance, 
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance 
  } = useReadContract({
    address: approvalParams?.tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: approvalParams ? [approvalParams.userAddress, approvalParams.spenderAddress] : undefined,
    query: {
      enabled: !!approvalParams,
    }
  })
  
  // Approval write contract
  const {
    writeContract: writeApproval,
    data: approvalTxHash,
    isPending: isApproving,
    error: approvalError,
    reset: resetApproval
  } = useWriteContract()
  
  // Wait for approval confirmation
  const {
    isLoading: isApprovingConfirming,
    isSuccess: isApprovalConfirmed,
    data: approvalReceipt
  } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  
  // Calculate gas cost
  const gasCost = gasLimit && gasPrice ? gasLimit * gasPrice : undefined
  const gasCostInEth = gasCost ? formatEther(gasCost) : '0'
  const gasCostInGwei = gasPrice ? formatGwei(gasPrice) : '0'
  
  // Check if approval is needed
  const checkApprovalNeeded = useCallback((params: TokenApprovalParams): boolean => {
    if (!currentAllowance) return true
    return currentAllowance < params.amount
  }, [currentAllowance])
  
  // Handle token approval with improved flow
  const handleTokenApproval = useCallback(async (params: TokenApprovalParams): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setApprovalParams(params)
      setApprovalProcessing(true)
      
      console.log('🔍 Checking allowance for token approval...')
      
      // Check allowance first
      const checkAllowanceAndProceed = () => {
        if (isLoadingAllowance) {
          console.log('⏳ Still loading allowance...')
          return
        }
        
        if (currentAllowance === undefined) {
          console.log('❌ Failed to load allowance')
          setApprovalProcessing(false)
          reject(new Error('Failed to load token allowance'))
          return
        }
        
        console.log('📊 Current allowance:', currentAllowance.toString())
        console.log('📊 Required amount:', params.amount.toString())
        
        const needsApproval = checkApprovalNeeded(params)
        console.log('🤔 Needs approval:', needsApproval)
        
        if (!needsApproval) {
          console.log('✅ Sufficient allowance, no approval needed')
          setApprovalProcessing(false)
          resolve(true)
          return
        }
        
        // Start approval process
        console.log('🚀 Starting approval transaction...')
        const approvalAmount = maxUint256 // Approve max amount
        
        writeApproval({
          address: params.tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [params.spenderAddress, approvalAmount],
        })
      }
      
      checkAllowanceAndProceed()
    })
  }, [currentAllowance, isLoadingAllowance, checkApprovalNeeded, writeApproval])
  
  // Effect to handle approval confirmation
  useEffect(() => {
    if (approvalProcessing && isApprovalConfirmed) {
      console.log('✅ Approval confirmed!')
      setApprovalProcessing(false)
      refetchAllowance() // Refresh allowance
    }
    
    if (approvalProcessing && approvalError) {
      console.error('❌ Approval failed:', approvalError)
      setApprovalProcessing(false)
    }
  }, [isApprovalConfirmed, approvalError, approvalProcessing, refetchAllowance])
  
  // Function to estimate gas
  const estimateGas = useCallback(async (params: GasEstimationParams) => {
    console.log('⛽ Starting gas estimation...')
    setEstimationParams(params)
    
    return new Promise((resolve) => {
      const checkEstimation = () => {
        if (!isLoadingGas) {
          if (gasLimit) {
            console.log('✅ Gas estimation complete:', gasLimit.toString())
            resolve(true)
          } else if (gasError) {
            console.error('❌ Gas estimation failed:', gasError)
            resolve(false)
          }
        }
      }
      
      checkEstimation()
    })
  }, [gasLimit, isLoadingGas, gasError])
  
  // Reset functions
  const resetEstimation = useCallback(() => {
    setEstimationParams(null)
  }, [])
  
  const resetApprovalState = useCallback(() => {
    setApprovalParams(null)
    setApprovalProcessing(false)
    resetApproval()
  }, [resetApproval])
  
  // Get approval state
  const getApprovalState = useCallback((): ApprovalState => {
    const needsApproval = approvalParams && currentAllowance !== undefined ? 
      checkApprovalNeeded(approvalParams) : false
    
    return {
      isNeeded: needsApproval,
      isApproving: approvalProcessing || isApproving || isApprovingConfirming,
      isApproved: isApprovalConfirmed,
      approvalTxHash,
      approvalError,
      currentAllowance,
    }
  }, [approvalParams, currentAllowance, checkApprovalNeeded, approvalProcessing, isApproving, isApprovingConfirming, isApprovalConfirmed, approvalTxHash, approvalError])
  
  return {
    // Gas estimation
    gasLimit,
    gasPrice,
    gasCost,
    gasCostInEth,
    gasCostInGwei,
    isLoading: isLoadingGas,
    error: gasError,
    
    // Functions
    estimateGas,
    resetEstimation,
    
    // Token approval
    handleTokenApproval,
    checkApprovalNeeded,
    getApprovalState,
    resetApprovalState,
    isLoadingAllowance,
    
    // Helper to format gas costs
    formatGasCost: (cost: bigint | undefined) => cost ? formatEther(cost) : '0',
    formatGasPrice: (price: bigint | undefined) => price ? formatGwei(price) : '0',
  }
}