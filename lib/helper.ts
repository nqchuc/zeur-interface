const formatNumber = (num: string | number, options?: {
  decimals?: number;
  preserveSmallNumbers?: boolean;
}) : string => {
  const value = typeof num === "string" ? Number.parseFloat(num) : num;
  const { decimals = 1, preserveSmallNumbers = true } = options || {};
  
  // Handle very small numbers (common in DeFi for precise token amounts)
  if (preserveSmallNumbers && value > 0 && value < 1) {
    return value.toFixed(6); // Show 6 decimals for small amounts
  }
  
  // Handle zero and negative
  if (value === 0) return "0";
  if (value < 0) return `-${formatNumber(Math.abs(value), options)}`;
  
  // Format large numbers
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(decimals)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
  
  // For numbers < 1000, show with reasonable precision
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
};

  const formatPercentage = (bps: string) => {
    return `${(Number.parseInt(bps))}%`
  }

  const formatUtilization = (rate: string) => {
    return `${(Number.parseInt(rate) / 1e16).toFixed(1)}%`
  }

  const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
    if (!address) return ""
    if (address.length <= startLength + endLength) return address
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
  }
  
  

  export { formatNumber, formatPercentage, formatUtilization, truncateAddress }