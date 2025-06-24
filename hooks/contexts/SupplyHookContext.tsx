"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import { 
  AssetData, 
  AssetType, 
  UserData, 
  FormattedAssetData, 
  FormattedUserDebtData 
} from '@/types/contracts'
import { UI_POOL_DATA_ADDRESS, UIPoolDataABI } from '@/contracts/UIPoolData'
import { PoolABI, POOL_ADDRESS } from '@/contracts/Pool'
import { ASSET_METADATA } from '@/lib/constants'
import { usePreTransactions } from '@/hooks/usePreTransactions'

interface SupplyFunctionParams {
  asset: Address
  amount: string // Amount in human readable format (will be converted to wei)
  decimals: number // Asset decimals for conversion
  isNativeToken?: boolean // Whether this is ETH or native token (no approval needed)
}

type SupplyStep = 'idle' | 'preparing' | 'executing' | 'confirming' | 'completed' | 'error'

interface SupplyContextValue {
  // Asset data
  debtAssets: FormattedAssetData[]
  isLoadingAssets: boolean
  errorAssets: Error | null
  refetchAssets: () => void
  
  // User data
  userData: any | null
  userDebtPositions: FormattedUserDebtData[]
  isLoadingUserData: boolean
  errorUserData: Error | null
  refetchUserData: () => void
  
  // Supply function
  supply: (params: SupplyFunctionParams) => Promise<void>
  supplyStep: SupplyStep
  supplyError: string | null
  supplyTxHash: Address | undefined
  isSupplying: boolean
  isSupplyConfirming: boolean
  isSupplyConfirmed: boolean
  supplyReceipt: any | undefined
  resetSupplyState: () => void
  
  // Pre-transaction state (approval + gas estimation)
  preTransactionState: {
    currentStep: string
    isProcessing: boolean
    isReady: boolean
    error: string | null
    currentAllowance: bigint | undefined
    needsApproval: boolean
    approvalTxHash: Address | undefined
    isApproving: boolean
    gasLimit: bigint | undefined
    gasPrice: bigint | undefined
    gasCost: bigint | undefined
    gasCostInEth: string
    gasCostInGwei: string
    isEstimatingGas: boolean
    statusMessage: string
  }
  
  // Helpers
  formatNumber: (value: string | number) => string
  formatPercentage: (value: string | number) => string
  formatUtilization: (value: string | bigint) => string
}

const SupplyContext = createContext<SupplyContextValue | undefined>(undefined)

export function SupplyProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  const [supplyStep, setSupplyStep] = useState<SupplyStep>('idle')
  const [supplyError, setSupplyError] = useState<string | null>(null)
  const [currentSupplyParams, setCurrentSupplyParams] = useState<SupplyFunctionParams | null>(null)
  
  // Universal pre-transactions hook for approval and gas estimation
  const preTransactions = usePreTransactions()
  
  // Supply contract write hook
  const {
    writeContract: writeSupply,
    data: supplyTxHash,
    isPending: isSupplying,
    error: contractSupplyError,
    reset: resetSupply
  } = useWriteContract()
  
  // Wait for transaction confirmation
  const {
    isLoading: isSupplyConfirming,
    isSuccess: isSupplyConfirmed,
    data: supplyReceipt
  } = useWaitForTransactionReceipt({
    hash: supplyTxHash,
  })
  
  // Fetch debt asset list
  const { data: debtAssetList, isLoading: isLoadingList, error: errorList, refetch: refetchList } = useReadContract({
    address: UI_POOL_DATA_ADDRESS,
    abi: UIPoolDataABI,
    functionName: 'getDebtAssetList',
  })
  
  // Prepare contract calls for all assets
  const assetDataCalls = useMemo(() => {
    console.log('debtAssetList', debtAssetList)
    if (!debtAssetList || debtAssetList.length === 0) return []
    
    return debtAssetList.map((asset) => ({
      address: UI_POOL_DATA_ADDRESS,
      abi: UIPoolDataABI,
      functionName: 'getAssetData',
      args: [asset],
    }))
  }, [debtAssetList])
  
  // Fetch all asset data in parallel
  const { data: assetsData, isLoading: isLoadingData, error: errorData, refetch: refetchData } = useReadContracts({
    contracts: assetDataCalls,
  })

  useEffect(() => {
    console.log(errorData, "ERROR DATA")
  }, [errorData])
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, error: errorUser, refetch: refetchUser } = useReadContract({
    address: UI_POOL_DATA_ADDRESS,
    abi: UIPoolDataABI,
    functionName: 'getUserData',
    args: userAddress ? [userAddress] : undefined,
  })
  
  // Format asset data
  const formattedAssets = useMemo(() => {
    console.log(assetsData, "ASSET DATA")
    if (!assetsData || !debtAssetList) return []
    
    return assetsData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null
        
        const assetData : any = result.result 
        const assetAddress = debtAssetList[index]
        const metadata = ASSET_METADATA[assetAddress] || {
          symbol: 'UNKNOWN',
          name: 'Unknown Asset',
          icon: '?',
          color: '#666666',
          protocols: []
        }
        
        const formatted: FormattedAssetData = {
          assetType: assetData.assetType,
          asset: assetData.asset,
          symbol: metadata.symbol,
          name: metadata.name,
          icon: metadata.icon,
          supplyCap: formatUnits(assetData.supplyCap, assetData.decimals),
          borrowCap: formatUnits(assetData.borrowCap, assetData.decimals),
          totalSupply: assetData.totalSupply ? formatUnits(assetData.totalSupply, assetData.decimals) : '0',
          totalBorrow: assetData.totalBorrow ? formatUnits(assetData.totalBorrow, assetData.decimals) : '0',
          utilizationRate: assetData.utilizationRate ? formatUnits(assetData.utilizationRate, 18) : '0',
          supplyRate: assetData.supplyRate?.toString() || '0',
          borrowRate: assetData.borrowRate?.toString() || '0',
          decimals: assetData.decimals,
          isFrozen: assetData.isFrozen,
          isPaused: assetData.isPaused,
          protocols: metadata.protocols,
          color: metadata.color,
        }
        
        return formatted
      })
      .filter((asset): asset is FormattedAssetData => asset !== null)
  }, [assetsData, debtAssetList])
  
  // Format user debt positions
  const formattedUserDebtPositions = useMemo(() => {
    if (!userData) return []
    
    return userData.userDebtData.map((position) => {
      const assetAddress = position.debtAsset
      const metadata = ASSET_METADATA[assetAddress] || {
        symbol: 'UNKNOWN',
        name: 'Unknown Asset',
        icon: '?',
      }
      
      // Find decimals from asset data
      const assetData = formattedAssets.find(a => a.asset === assetAddress)
      const decimals = assetData?.decimals || 18
      
      const supplyBalance = formatUnits(position.supplyBalance, decimals)
      const borrowBalance = formatUnits(position.borrowBalance, decimals)
      const netBorrow = (parseFloat(supplyBalance) - parseFloat(borrowBalance)).toFixed(2)
      
      return {
        debtAsset: position.debtAsset,
        symbol: metadata.symbol,
        name: metadata.name,
        icon: metadata.icon,
        supplyBalance,
        borrowBalance,
        netBorrow,
      }
    })
  }, [userData, formattedAssets])
  
  // Supply function with universal pre-transaction flow
  const supply = async ({ asset, amount, decimals, isNativeToken = false }: SupplyFunctionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    try {
      console.log('🚀 Starting supply process for', amount, asset)
      setCurrentSupplyParams({ asset, amount, decimals, isNativeToken })
      setSupplyStep('preparing')
      setSupplyError(null)
      
      const amountInWei = parseUnits(amount, decimals)
      
      // Step 1: Prepare transaction (approval + gas estimation)
      await preTransactions.prepare({
        contractAddress: POOL_ADDRESS,
        contractAbi: PoolABI,
        functionName: 'supply',
        args: [asset, amountInWei, userAddress],
        value: isNativeToken ? amountInWei : undefined,
        
        // Token approval params (only for ERC20 tokens)
        tokenAddress: isNativeToken ? undefined : asset,
        tokenAmount: isNativeToken ? undefined : amountInWei,
        spenderAddress: isNativeToken ? undefined : POOL_ADDRESS,
        skipApproval: isNativeToken,
      })
      
      console.log('✅ Pre-transaction preparation completed')
      
    } catch (error) {
      console.error('❌ Error in supply preparation:', error)
      setSupplyError(error instanceof Error ? error.message : 'Unknown error')
      setSupplyStep('error')
    }
  }
  
  // Effect to handle pre-transaction completion and execute supply
  useEffect(() => {
    if (supplyStep === 'preparing' && preTransactions.isReady && currentSupplyParams) {
      console.log('🔥 Pre-transactions ready, executing supply transaction')
      setSupplyStep('executing')
      
      const amountInWei = parseUnits(currentSupplyParams.amount, currentSupplyParams.decimals)
      
      writeSupply({
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'supply',
        args: [currentSupplyParams.asset, amountInWei, userAddress],
        gas: preTransactions.estimatedGasLimit,
        value: currentSupplyParams.isNativeToken ? amountInWei : undefined,
      })
    }
  }, [supplyStep, preTransactions.isReady, currentSupplyParams, userAddress, writeSupply, preTransactions.estimatedGasLimit])
  
  // Effect to handle supply transaction states
  useEffect(() => {
    if (supplyStep === 'executing' && supplyTxHash) {
      console.log('⏳ Supply transaction submitted, waiting for confirmation')
      setSupplyStep('confirming')
    }
  }, [supplyStep, supplyTxHash])
  
  // Effect to handle supply completion
  useEffect(() => {
    if (supplyStep === 'confirming' && isSupplyConfirmed) {
      console.log('🎉 Supply completed successfully!')
      setSupplyStep('completed')
    }
  }, [supplyStep, isSupplyConfirmed])
  
  // Effect to handle pre-transaction errors
  useEffect(() => {
    if (supplyStep === 'preparing' && preTransactions.error) {
      setSupplyError(preTransactions.error)
      setSupplyStep('error')
    }
  }, [supplyStep, preTransactions.error])
  
  // Effect to handle contract errors
  useEffect(() => {
    if (contractSupplyError) {
      setSupplyError(`Supply transaction failed: ${contractSupplyError.message}`)
      setSupplyStep('error')
    }
  }, [contractSupplyError])
  
  // Reset supply state
  const resetSupplyState = () => {
    setSupplyStep('idle')
    setSupplyError(null)
    setCurrentSupplyParams(null)
    resetSupply()
    preTransactions.reset()
  }
  
  // Auto-refetch data when supply is confirmed
  useEffect(() => {
    if (isSupplyConfirmed) {
      console.log('🔄 Refreshing data after successful supply')
      // Refetch both asset and user data after successful supply
      refetchData()
      refetchUser()
      
      // Reset states after successful transaction (with delay for better UX)
      setTimeout(() => {
        resetSupplyState()
      }, 3000) // Wait 3 seconds before resetting
    }
  }, [isSupplyConfirmed, refetchData, refetchUser])
  
  // Helper functions
  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }
  
  const formatPercentage = (value: string | number) => {
    const bps = typeof value === 'string' ? parseInt(value) : value
    return `${(bps / 100).toFixed(2)}%`
  }
  
  const formatUtilization = (value: string | bigint) => {
    const utilization = typeof value === 'string' ? parseFloat(value) : Number(value) / 1e18
    return `${(utilization * 100).toFixed(2)}%`
  }
  
  const contextValue: SupplyContextValue = {
    debtAssets: formattedAssets,
    isLoadingAssets: isLoadingList || isLoadingData,
    errorAssets: errorList || errorData || null,
    refetchAssets: () => {
      refetchList()
      refetchData()
    },
    
    userData: userData || null,
    userDebtPositions: formattedUserDebtPositions,
    isLoadingUserData: isLoadingUser,
    errorUserData: errorUser || null,
    refetchUserData: refetchUser,
    
    // Supply function and states
    supply,
    supplyStep,
    supplyError,
    supplyTxHash,
    isSupplying,
    isSupplyConfirming,
    isSupplyConfirmed,
    supplyReceipt,
    resetSupplyState,
    
    // Pre-transaction state (approval + gas estimation)
    preTransactionState: {
      currentStep: preTransactions.currentStep,
      isProcessing: preTransactions.isProcessing,
      isReady: preTransactions.isReady,
      error: preTransactions.error,
      currentAllowance: preTransactions.currentAllowance,
      needsApproval: preTransactions.needsApproval,
      approvalTxHash: preTransactions.approvalTxHash,
      isApproving: preTransactions.isApproving,
      gasLimit: preTransactions.gasLimit,
      gasPrice: preTransactions.gasPrice,
      gasCost: preTransactions.gasCost,
      gasCostInEth: preTransactions.gasCostInEth,
      gasCostInGwei: preTransactions.gasCostInGwei,
      isEstimatingGas: preTransactions.isEstimatingGas,
      statusMessage: preTransactions.statusMessage,
    },
    
    formatNumber,
    formatPercentage,
    formatUtilization,
  }
  
  return (
    <SupplyContext.Provider value={contextValue}>
      {children}
    </SupplyContext.Provider>
  )
}

export function useSupply() {
  const context = useContext(SupplyContext)
  if (!context) {
    throw new Error('useSupply must be used within SupplyProvider')
  }
  return context
}