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
import { TransactionState, useTransactions, ZeurTransactionType } from '@/hooks/useTransactions'

interface SupplyFunctionParams {
  asset: Address
  amount: string
  decimals: number
  isNativeToken?: boolean
  symbol: string
}

interface WithdrawFunctionParams {
  asset: Address
  amount: string
  decimals: number
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
  withdraw: (params: WithdrawFunctionParams) => Promise<void>

  // tx state
  transactionState: TransactionState
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
  const {execute, transactionState, reset} = useTransactions()
  
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
        utilizationRate: assetData?.utilizationRate || '0',
        supplyRate: assetData?.supplyRate || '0',
        supplyBalance,
        borrowBalance,
        netBorrow,
        decimals: decimals
      }
    })
  }, [userData, formattedAssets])
  
  // Simple supply function using the universal transactions hook
  const supply = async ({ asset, amount, decimals, isNativeToken = false, symbol }: SupplyFunctionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log(decimals, "DECIMALS")
    const amountInWei = parseUnits(amount, decimals)
    
    // Create transaction request
    const transactionRequest = {
      type: 'supply' as ZeurTransactionType,
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
      metadata: {
        asset: symbol,
        amount: amount,
        decimals: decimals,
        isNativeToken,
      }
    }
    
    // Execute transaction (handles approval + execution automatically)
    await execute(transactionRequest)
  }
  
  // Auto-refetch data when transaction is completed
  // useEffect(() => {
  //   if (transactions.transactionState.isCompleted) {
  //     console.log('🔄 Refreshing data after successful supply')
  //     refetchData()
  //     refetchUser()
      
  //     // Reset transaction after 3 seconds for better UX
  //     setTimeout(() => {
  //       transactions.reset()
  //     }, 3000)
  //   }
  // }, [transactions.transactionState.isCompleted, refetchData, refetchUser, transactions.reset])


  const withdraw = async ({ asset, amount, decimals }: WithdrawFunctionParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log('🚀 Starting withdraw transaction', { asset, amount, decimals })
    const amountInWei = parseUnits(amount, decimals)
    
    // Get asset metadata for better logging
    const assetMetadata = formattedAssets.find(a => a.asset === asset)
    
    // Create transaction request with type
    const transactionRequest = {
      type: 'withdraw' as ZeurTransactionType,
      writeContract: {
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'withdraw',
        args: [asset, amountInWei, userAddress],
      },
      // Withdraw doesn't need approval since we're withdrawing our own funds
      metadata: {
        asset: assetMetadata?.symbol || 'Unknown',
        amount: amount,
        decimals: decimals,
      }
    }
    
    // Execute transaction
    await execute(transactionRequest)
  }
  
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
      refetchUser()
    },
    
    userData: userData || null,
    userDebtPositions: formattedUserDebtPositions,
    isLoadingUserData: isLoadingUser,
    errorUserData: errorUser || null,
    refetchUserData: refetchUser,
    
    /// write function
    supply,
    withdraw,
    
    formatNumber,
    formatPercentage,
    formatUtilization,

    transactionState,
    resetTransaction: reset,
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