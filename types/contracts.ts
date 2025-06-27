import { Address } from 'viem'

export enum AssetType {
  Collateral = 1,
  Debt = 2
}

export interface StakedTokenData {
  stakedToken: Address
  underlyingAmount: bigint
  stakedAmount: bigint
}

export interface AssetData {
  assetType: number
  asset: string
  supplyCap: bigint
  borrowCap: bigint
  totalSupply?: bigint
  totalBorrow?: bigint
  totalShares?: bigint
  utilizationRate?: bigint
  supplyRate?: bigint
  borrowRate?: bigint
  ltv?: number
  liquidationThreshold?: number
  liquidationBonus?: number
  liquidationProtocolFee?: number
  reserveFactor?: number
  decimals: number
  isFrozen: boolean
  isPaused: boolean
  stakedTokens?: StakedTokenData[]
  colToken: string
  debtToken: string
  tokenVault: string
}

export interface UserCollateralData {
  collateralAsset: Address
  supplyBalance: bigint
}

export interface UserDebtData {
  debtAsset: Address
  supplyBalance: bigint
  borrowBalance: bigint
}

export interface UserData {
  totalCollateralValue: bigint
  totalDebtValue: bigint
  availableBorrowsValue: bigint
  currentLiquidationThreshold: bigint
  ltv: bigint
  healthFactor: bigint
  userCollateralData: UserCollateralData[]
  userDebtData: UserDebtData[]
}

// UI formatted types
export interface FormattedAssetData {
  assetType: AssetType
  asset: Address
  assetColAddress?: Address
  symbol: string
  name: string
  icon: string
  supplyCap: string
  borrowCap: string
  totalSupply: string
  totalBorrow: string
  utilizationRate: string
  supplyRate: string
  borrowRate: string
  decimals: number
  isFrozen: boolean
  isPaused: boolean
  protocols: string[]
}

export interface FormattedUserDebtData {
  debtAsset: Address
  symbol: string
  name: string
  icon: string
  supplyBalance: string
  borrowBalance: string
  netBorrow: string
  utilizationRate: string
  supplyRate: string
  decimals: number
}