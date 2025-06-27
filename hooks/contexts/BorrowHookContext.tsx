"use client"
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import { 
  AssetData, 
  AssetType, 
  UserData, 
  FormattedAssetData,
  UserCollateralData
} from '@/types/contracts'
import { UI_POOL_DATA_ADDRESS, UIPoolDataABI } from '@/contracts/UIPoolData'
import { PoolABI, POOL_ADDRESS } from '@/contracts/Pool'
import { ASSET_METADATA } from '@/lib/constants'
import { TransactionState, useTransactions, ZeurTransactionType } from '@/hooks/useTransactions'

export interface FormattedCollateralData extends FormattedAssetData {
  ltv: string
  liquidationThreshold: string
  liquidationBonus: string
  currentPrice?: number
  apy?: string
}

export interface FormattedUserCollateralData {
  collateralAsset: Address
  symbol: string
  name: string
  icon: string
  supplyBalance: string
  balanceUSD: string
  ltv: string
  liquidationThreshold: string
}

export interface FormattedUserBorrowData {
  debtAsset: Address
  symbol: string
  name: string
  icon: string
  borrowBalance: string
  borrowBalanceUSD: string
  borrowRate: string
}

interface SupplyCollateralParams {
  asset: Address
  amount: string
  decimals: number
  isNativeToken?: boolean
  symbol: string
}

interface BorrowParams {
  asset: Address
  amount: string
  decimals: number
  symbol: string
}

interface BorrowContextValue {
  // Asset data
  collateralAssets: FormattedCollateralData[]
  isLoadingAssets: boolean
  errorAssets: Error | null
  refetchAssets: () => void
  
  // User data
  userData: any | null
  userCollateralPositions: FormattedUserCollateralData[]
  userBorrowPositions: FormattedUserBorrowData[]
  isLoadingUserData: boolean
  errorUserData: Error | null
  refetchUserData: () => void
  
  // Transaction functions
  supplyCollateral: (params: SupplyCollateralParams) => Promise<void>
  borrow: (params: BorrowParams) => Promise<void>
  
  // Transaction state
  transactionState: TransactionState
  resetTransaction: () => void
  
  // Helpers
  calculateHealthFactor: (ltv: number) => { value: number; status: string; color: string }
}

const BorrowContext = createContext<BorrowContextValue | undefined>(undefined)

export function BorrowProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  
  // Universal transactions hook
  const {execute, transactionState, reset} = useTransactions()
  
  // Fetch only collateral asset list
  const { data: collateralAssetList, isLoading: isLoadingCollateralList, error: errorCollateralList, refetch: refetchCollateralList } = useReadContract({
    address: UI_POOL_DATA_ADDRESS,
    abi: UIPoolDataABI,
    functionName: 'getCollateralAssetList',
  })
  
  // Prepare contract calls for collateral assets only
  const assetDataCalls = useMemo(() => {
    if (!collateralAssetList || collateralAssetList.length === 0) return []
    
    return collateralAssetList.map((asset) => ({
      address: UI_POOL_DATA_ADDRESS,
      abi: UIPoolDataABI,
      functionName: 'getAssetData',
      args: [asset],
    }))
  }, [collateralAssetList])
  
  // Fetch all asset data in parallel
  const { data: assetsData, isLoading: isLoadingData, error: errorData, refetch: refetchData } = useReadContracts({
    contracts: assetDataCalls,
  })
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, error: errorUser, refetch: refetchUser } = useReadContract({
    address: UI_POOL_DATA_ADDRESS,
    abi: UIPoolDataABI,
    functionName: 'getUserData',
    args: userAddress ? [userAddress] : undefined,
  })
  
  // Format collateral asset data
  const formattedCollateralAssets = useMemo(() => {
    if (!assetsData || !collateralAssetList) return []
    
    return assetsData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null
        
        const assetData = result.result as any
        const assetAddress = collateralAssetList[index]
        const metadata = ASSET_METADATA[assetAddress] || {
          symbol: 'UNKNOWN',
          name: 'Unknown Asset',
          icon: '?',
          color: '#666666',
          protocols: []
        }
        
        const formatted: FormattedCollateralData = {
          assetType: assetData.assetType,
          asset: assetData.asset,
          assetColAddress: assetData.colToken,
          symbol: metadata.symbol,
          name: metadata.name,
          icon: metadata.icon,
          supplyCap: formatUnits(assetData.supplyCap, assetData.decimals),
          borrowCap: formatUnits(assetData.borrowCap, assetData.decimals),
          totalSupply: formatUnits(assetData.totalSupply, assetData.decimals),
          totalBorrow: '0',
          utilizationRate: '0',
          supplyRate: '0',
          borrowRate: '0',
          decimals: assetData.decimals,
          isFrozen: assetData.isFrozen,
          isPaused: assetData.isPaused,
          protocols: metadata.protocols,
          ltv: assetData.ltv ? (assetData.ltv / 100).toFixed(1) : '0',
          liquidationThreshold: assetData.liquidationThreshold ? (assetData.liquidationThreshold / 100).toFixed(1) : '0',
          liquidationBonus: assetData.liquidationBonus ? (assetData.liquidationBonus / 100).toFixed(1) : '0',
          // Add mock prices for demo - in production, get from price oracle
          currentPrice: metadata.symbol === 'ETH' ? 3420 : 
                       metadata.symbol === 'stETH' ? 3415 : 
                       metadata.symbol === 'WBTC' ? 67800 : 
                       metadata.symbol === 'LINK' ? 14.5 : 0,
          apy: metadata.symbol === 'ETH' ? '4.2%' : 
               metadata.symbol === 'stETH' ? '5.8%' : 
               metadata.symbol === 'WBTC' ? '2.9%' : 
               metadata.symbol === 'LINK' ? '3.1%' : '0%',
        }
        
        return formatted
      })
      .filter((asset): asset is FormattedCollateralData => asset !== null)
  }, [assetsData, collateralAssetList])
  
  // Format user collateral positions
  const formattedUserCollateralPositions = useMemo(() => {
    if (!userData) return []
    
    return userData.userCollateralData.map((position) => {
      const assetAddress = position.collateralAsset
      const metadata = ASSET_METADATA[assetAddress] || {
        symbol: 'UNKNOWN',
        name: 'Unknown Asset',
        icon: '?',
      }
      
      // Find asset data for additional info
      const assetData = formattedCollateralAssets.find(a => a.asset === assetAddress)
      const decimals = assetData?.decimals || 18
      const price = assetData?.currentPrice || 0
      
      const supplyBalance = formatUnits(position.supplyBalance, decimals)
      const balanceUSD = (parseFloat(supplyBalance) * price).toFixed(2)
      
      return {
        collateralAsset: position.collateralAsset,
        symbol: metadata.symbol,
        name: metadata.name,
        icon: metadata.icon,
        supplyBalance,
        balanceUSD,
        ltv: assetData?.ltv || '0',
        liquidationThreshold: assetData?.liquidationThreshold || '0',
      }
    })
  }, [userData, formattedCollateralAssets])

  // Format user borrow positions
  const formattedUserBorrowPositions = useMemo(() => {
    if (!userData) return []
    
    return userData.userDebtData.map((position) => {
      const assetAddress = position.debtAsset
      const metadata = ASSET_METADATA[assetAddress] || {
        symbol: 'UNKNOWN',
        name: 'Unknown Asset',
        icon: '?',
      }
      
      // Find decimals from asset data
      const decimals = 18 // Most stablecoins are 18 decimals
      
      const borrowBalance = formatUnits(position.borrowBalance, decimals)
      const borrowBalanceUSD = (parseFloat(borrowBalance) * 1.0).toFixed(2) // Assume 1:1 for stablecoins
      
      return {
        debtAsset: position.debtAsset,
        symbol: metadata.symbol,
        name: metadata.name,
        icon: metadata.icon,
        borrowBalance,
        borrowBalanceUSD,
        borrowRate: '0', // Zero interest rate
      }
    })
  }, [userData])
  
  // Supply collateral function
  const supplyCollateral = async ({ asset, amount, decimals, isNativeToken = false, symbol }: SupplyCollateralParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    // Check if this is a native token
    const isNative = asset === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    
    console.log('🚀 Starting collateral supply transaction', { asset, amount, decimals, symbol, isNative })
    const amountInWei = parseUnits(amount, decimals)
    
    // Create transaction request
    const transactionRequest = {
      type: 'supply' as ZeurTransactionType,
      writeContract: {
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'supply',
        args: [asset, amountInWei, userAddress],
        value: isNative ? amountInWei : undefined,
      },
      // Only add approval for ERC20 tokens (not for native tokens)
      approval: isNative ? undefined : {
        tokenAddress: asset,
        tokenAmount: amountInWei,
        spenderAddress: POOL_ADDRESS,
      },
      metadata: {
        asset: symbol,
        amount: amount,
        decimals: decimals,
        isNativeToken: isNative,
      }
    }
    
    // Execute transaction (handles approval + execution automatically)
    await execute(transactionRequest)
  }

  // Borrow function
  const borrow = async ({ asset, amount, decimals, symbol }: BorrowParams) => {
    if (!userAddress) {
      throw new Error('User not connected')
    }
    
    console.log('🚀 Starting borrow transaction', { asset, amount, decimals, symbol })
    const amountInWei = parseUnits(amount, decimals)
    
    // Create transaction request
    const transactionRequest = {
      type: 'borrow' as ZeurTransactionType,
      writeContract: {
        address: POOL_ADDRESS,
        abi: PoolABI,
        functionName: 'borrow',
        args: [asset, amountInWei, userAddress],
      },
      // No approval needed for borrowing
      metadata: {
        asset: symbol,
        amount: amount,
        decimals: decimals,
      }
    }
    
    // Execute transaction
    await execute(transactionRequest)
  }
  
  // Helper functions
  const calculateHealthFactor = (ltv: number) => {
    if (ltv < 50) return { value: 2.5, status: "Excellent", color: "text-green-400" }
    if (ltv < 70) return { value: 1.8, status: "Good", color: "text-blue-400" }
    if (ltv < 80) return { value: 1.2, status: "Moderate", color: "text-yellow-400" }
    return { value: 1.0, status: "Risky", color: "text-red-400" }
  }
  
  const contextValue: BorrowContextValue = {
    collateralAssets: formattedCollateralAssets,
    isLoadingAssets: isLoadingCollateralList || isLoadingData,
    errorAssets: errorCollateralList || errorData || null,
    refetchAssets: () => {
      refetchCollateralList()
      refetchData()
      refetchUser()
    },
    
    userData: userData || null,
    userCollateralPositions: formattedUserCollateralPositions,
    userBorrowPositions: formattedUserBorrowPositions,
    isLoadingUserData: isLoadingUser,
    errorUserData: errorUser || null,
    refetchUserData: refetchUser,
    
    // Transaction functions
    supplyCollateral,
    borrow,
    
    // Transaction state
    transactionState,
    resetTransaction: reset,
    
    calculateHealthFactor,
  }
  
  return (
    <BorrowContext.Provider value={contextValue}>
      {children}
    </BorrowContext.Provider>
  )
}

export function useBorrow() {
  const context = useContext(BorrowContext)
  if (!context) {
    throw new Error('useBorrow must be used within BorrowProvider')
  }
  return context
}