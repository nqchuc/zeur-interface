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
import { UIPoolDataABI } from '@/contracts/UIPoolData'
import { ASSET_METADATA } from '@/lib/constants'

// Contract address - update this with your deployed contract
const UI_POOL_DATA_ADDRESS = process.env.NEXT_PUBLIC_UI_POOL_DATA_ADDRESS as Address || '0x0000000000000000000000000000000000000000'

// Asset metadata (symbols, names, icons, etc.)


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
  
  // Pagination
  // currentPage: number
  // totalPages: number
  // setCurrentPage: (page: number) => void
  // paginatedAssets: FormattedAssetData[]
  
  // Helpers
  formatNumber: (value: string | number) => string
  formatPercentage: (value: string | number) => string
  formatUtilization: (value: string | bigint) => string
}

const SupplyContext = createContext<SupplyContextValue | undefined>(undefined)

const ITEMS_PER_PAGE = 10

export function SupplyProvider({ children }: { children: React.ReactNode }) {
  const { address: userAddress } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  
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
        const assetAddress = assetData.debtToken
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
  
  // Pagination
  // const totalPages = Math.ceil(formattedAssets.length / ITEMS_PER_PAGE)
  // const paginatedAssets = formattedAssets.slice(
  //   (currentPage - 1) * ITEMS_PER_PAGE,
  //   currentPage * ITEMS_PER_PAGE
  // )
  
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
    
    // currentPage,
    // totalPages,
    // setCurrentPage,
    // paginatedAssets,
    
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