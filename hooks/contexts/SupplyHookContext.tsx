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
import { PoolABI, POOL_ADDRESS } from '@/contracts/Pool' // Import from your first file
import { ASSET_METADATA } from '@/lib/constants'
import { useGasEstimation } from '@/hooks/useGasEstimation'

interface SupplyFunctionParams {
  asset: Address
  amount: string // Amount in human readable format (will be converted to wei)
  decimals: number // Asset decimals for conversion
  isNativeToken?: boolean // Whether this is ETH or native token (no approval needed)
}

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
  isSupplying: boolean
  supplyError: Error | null
  supplyTxHash: Address | undefined
  isSupplyConfirming: boolean
  isSupplyConfirmed: boolean
  supplyReceipt: any | undefined
  resetSupplyState: () => void
  
  // Gas estimation (automatically triggered)
  gasEstimation: {
    gasLimit: bigint | undefined
    gasPrice: bigint | undefined
    gasCost: bigint | undefined
    gasCostInEth: string
    gasCostInGwei: string
    isLoading: boolean
    error: Error | null
  }
  resetGasEstimation: () => void
  
  // Token approval state
  approvalState: {
    isNeeded: boolean
    isApproving: boolean
    isApproved: boolean
    approvalTxHash: Address | undefined
    approvalError: Error | null
    currentAllowance: bigint | undefined
  }
  resetApprovalState: () => void
  
  // Helpers
  formatNumber: (value: string | number) => string
  formatPercentage: (value: string | number) => string
  formatUtilization: (value: string | bigint) => string
}

const SupplyContext = createContext<SupplyContextValue | undefined>(undefined)

export function SupplyProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  
  // Gas estimation and approval hook
  const {
    gasLimit,
    gasPrice,
    gasCost,
    gasCostInEth,
    gasCostInGwei,
    isLoading: isGasLoading,
    error: gasError,
    estimateGas,
    resetEstimation,
    // Approval functions
    handleTokenApproval,
    getApprovalState,
    resetApprovalState,
    isLoadingAllowance
  } = useGasEstimation()
  
  // Supply contract write hook
  const {
    writeContract: writeSupply,
    data: supplyTxHash,
    isPending: isSupplying,
    error: supplyError,
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
  
  // Supply function with automatic approval and gas estimation
  const supply = async ({ asset, amount, decimals, isNativeToken = false }: SupplyFunctionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    try {
      const amountInWei = parseUnits(amount, decimals)
      
      // Step 1: Handle token approval for ERC20 tokens (skip for native tokens like ETH)
      if (!isNativeToken) {
        console.log('Checking token approval...')
        
        const approvalSuccess = await handleTokenApproval({
          tokenAddress: asset,
          spenderAddress: POOL_ADDRESS,
          amount: amountInWei,
          userAddress
        })
        
        if (!approvalSuccess) {
          throw new Error('Token approval failed or was cancelled')
        }
        
        console.log('Token approval completed successfully')
      }
      
      // Step 2: Estimate gas for supply transaction
      console.log('Estimating gas for supply transaction...')
      await estimateGas({
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'supply',
        args: [asset, amountInWei, userAddress],
        account: userAddress,
        // Add ETH value for native token supply
        value: isNativeToken ? amountInWei : undefined,
      })
      
      // Wait a bit for gas estimation to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (gasError) {
        throw new Error(`Gas estimation failed: ${gasError.message}`)
      }
      
      console.log('Gas estimated, proceeding with supply transaction...')
      
      // Step 3: Execute supply transaction
      writeSupply({
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'supply',
        args: [asset, amountInWei, userAddress],
        gas: gasLimit, // Use estimated gas limit
        value: isNativeToken ? amountInWei : undefined, // Add ETH value for native token
      })
    } catch (error) {
      console.error('Error in supply process:', error)
      throw error
    }
  }
  
  // Reset supply state
  const resetSupplyState = () => {
    resetSupply()
  }
  
  // Reset gas estimation
  const resetGasEstimation = () => {
    resetEstimation()
  }
  
  // Auto-refetch data when supply is confirmed
  useEffect(() => {
    if (isSupplyConfirmed) {
      // Refetch both asset and user data after successful supply
      refetchData()
      refetchUser()
      
      // Reset all states after successful transaction
      setTimeout(() => {
        resetGasEstimation()
        resetApprovalState()
      }, 2000) // Wait 2 seconds before resetting for better UX
    }
  }, [isSupplyConfirmed, refetchData, refetchUser, resetEstimation, resetApprovalState])
  
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
    isSupplying,
    supplyError,
    supplyTxHash,
    isSupplyConfirming,
    isSupplyConfirmed,
    supplyReceipt,
    resetSupplyState,
    
    // Gas estimation (automatic)
    gasEstimation: {
      gasLimit,
      gasPrice,
      gasCost,
      gasCostInEth,
      gasCostInGwei,
      isLoading: isGasLoading,
      error: gasError,
    },
    resetGasEstimation,
    
    // Token approval state
    approvalState: getApprovalState(),
    resetApprovalState,
    
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