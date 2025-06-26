"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
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
import { useTransactions } from '@/hooks/useTransactions'

interface SupplyFunctionParams {
  asset: Address
  amount: string
  decimals: number
  isNativeToken?: boolean
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
  
  // Transaction state
  transactionState: {
    currentStep: string
    isProcessing: boolean
    isCompleted: boolean
    error: string | null
    currentAllowance?: bigint
    needsApproval: boolean
    approvalTxHash?: Address
    txHash?: Address
    statusMessage: string
  }
  resetTransaction: () => void
  
  // Helpers
  formatNumber: (value: string | number) => string
  formatPercentage: (value: string | number) => string
  formatUtilization: (value: string | bigint) => string
}

const SupplyContext = createContext<SupplyContextValue | undefined>(undefined)

export function SupplyProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  
  // Universal transactions hook
  const transactions = useTransactions()
  
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
        }
        
        return formatted
      })
      .filter((asset): asset is FormattedAssetData => asset !== null)
  }, [assetsData, debtAssetList])
  
  // Format user debt positions
  const formattedUserDebtPositions = useMemo(() => {
    if (!userData) return []
    

    console.log(userData, "USER DATA")

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
  
  // Simple supply function using the universal transactions hook
  const supply = async ({ asset, amount, decimals, isNativeToken = false }: SupplyFunctionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log(decimals, "DECIMALS")
    const amountInWei = parseUnits(amount, decimals)
    
    // Create transaction request
    const transactionRequest = {
      writeContract: {
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'supply',
        args: [asset, amountInWei, userAddress],
        value: isNativeToken ? amountInWei : undefined,
      },
      // Only add approval for ERC20 tokens
      approval: isNativeToken ? undefined : {
        tokenAddress: asset,
        tokenAmount: amountInWei,
        spenderAddress: POOL_ADDRESS,
      },
    }
    
    // Execute transaction (handles approval + execution automatically)
    await transactions.execute(transactionRequest)
  }
  
  // Auto-refetch data when transaction is completed
  useEffect(() => {
    if (transactions.isCompleted) {
      console.log('🔄 Refreshing data after successful supply')
      refetchData()
      refetchUser()
      
      // Reset transaction after 3 seconds for better UX
      setTimeout(() => {
        transactions.reset()
      }, 3000)
    }
  }, [transactions.isCompleted, refetchData, refetchUser, transactions.reset])
  
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
    
    // Supply function
    supply,
    
    // Transaction state (from useTransactions)
    transactionState: {
      currentStep: transactions.currentStep,
      isProcessing: transactions.isProcessing,
      isCompleted: transactions.isCompleted,
      error: transactions.error,
      currentAllowance: transactions.currentAllowance,
      needsApproval: transactions.needsApproval,
      approvalTxHash: transactions.approvalTxHash,
      txHash: transactions.txHash,
      statusMessage: transactions.statusMessage,
    },
    resetTransaction: transactions.reset,
    
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