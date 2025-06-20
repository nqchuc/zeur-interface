const formatNumber = (num: string | number, decimals = 2) => {
    const value = typeof num === "string" ? Number.parseFloat(num) : num
    if (value >= 1000000) return `${(value / 1000000).toFixed(decimals)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(decimals)}K`
    return value.toFixed(decimals)
  }

  const formatPercentage = (bps: string) => {
    return `${(Number.parseInt(bps) / 100).toFixed(2)}%`
  }

  const formatUtilization = (rate: string) => {
    return `${(Number.parseInt(rate) / 1e16).toFixed(1)}%`
  }

  

  export { formatNumber, formatPercentage, formatUtilization }