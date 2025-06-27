// hooks/useTokenBalance.ts
import { useBalance } from 'wagmi'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'

export interface TokenBalanceResult {
  balance: string
  balanceFormatted: string
  balanceNumber: number
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useTokenBalance(tokenAddress?: string, decimals: number = 18): TokenBalanceResult {
  const { address: userAddress } = useAccount()
  
  // Check if this is a native token (ETH)
  const isNativeToken = tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
  
  const {
    data: balanceData,
    isLoading,
    error,
    refetch
  } = useBalance({
    address: userAddress,
    // For native tokens, don't pass token parameter. For ERC20 tokens, pass the token address
    token: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    query: {
      enabled: !!userAddress && !!tokenAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  // Format the balance for display
  const formatBalance = (rawBalance?: bigint, decimals: number = 18): { formatted: string; number: number } => {
    if (!rawBalance) return { formatted: '0.00', number: 0 }
    
    const formatted = formatUnits(rawBalance, decimals)
    const number = parseFloat(formatted)
    
    // Format with appropriate decimal places
    if (number >= 1000000) {
      return { formatted: (number / 1000000).toFixed(2) + 'M', number }
    } else if (number >= 1000) {
      return { formatted: (number / 1000).toFixed(2) + 'K', number }
    } else if (number >= 1) {
      return { formatted: number.toFixed(2), number }
    } else if (number > 0) {
      return { formatted: number.toFixed(6), number }
    } else {
      return { formatted: '0.00', number: 0 }
    }
  }

  const { formatted, number } = formatBalance(balanceData?.value, decimals)

  return {
    balance: balanceData?.value?.toString() || '0',
    balanceFormatted: formatted,
    balanceNumber: number,
    isLoading,
    error,
    refetch
  }
}

// Helper function to check if token is native
export function isNativeToken(tokenAddress?: string): boolean {
  return tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}

// Helper function to get max amount user can supply (considering gas fees)
export function getMaxSupplyAmount(balance: number, tokenAddress?: string): string {
  if (balance <= 0) return '0'
  
  // For native tokens (ETH, MATIC), reserve some for gas fees
  if (isNativeToken(tokenAddress)) {
    const gasReserve = 0.001 // Reserve 0.001 ETH for gas
    const maxAmount = Math.max(0, balance - gasReserve)
    return maxAmount.toString()
  }
  
  // For ERC20 tokens, user can supply full balance
  return balance.toString()
}