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
import { ASSET_METADATA } from '@/lib/constants'

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

interface BorrowContextValue {
  // Asset data
  collateralAssets: FormattedCollateralData[]
  isLoadingAssets: boolean
  errorAssets: Error | null
  refetchAssets: () => void
  
  // User data
  userData: any | null
  userCollateralPositions: FormattedUserCollateralData[]
  isLoadingUserData: boolean
  errorUserData: Error | null
  refetchUserData: () => void
  
  // Helpers
//   formatNumber: (value: string | number) => string
//   formatPercentage: (value: string | number) => string
  calculateHealthFactor: (ltv: number) => { value: number; status: string; color: string }
}

const BorrowContext = createContext<BorrowContextValue | undefined>(undefined)

export function BorrowProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  
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
        
        console.log(collateralAssetList, "collateralAssetList")
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
    },
    
    userData: userData || null,
    userCollateralPositions: formattedUserCollateralPositions,
    isLoadingUserData: isLoadingUser,
    errorUserData: errorUser || null,
    refetchUserData: refetchUser,
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