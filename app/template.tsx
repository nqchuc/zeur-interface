"use client"
import { usePathname } from 'next/navigation'
import React from 'react'
import LandingNavbar from '../components/LandingNavbar'
import Navbar from '../components/Navbar'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmiConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupplyProvider } from '@/hooks/contexts/SupplyHookContext'
import { BorrowProvider } from '@/hooks/contexts/BorrowHookContext'

function Template({
  children,
}: {
  children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLandingPage = pathname === "/"
    const queryClient = new QueryClient()

    return (
    <WagmiProvider config={wagmiConfig}> 
        <QueryClientProvider client={queryClient}>
            <SupplyProvider> 
              <BorrowProvider>
                <div className="min-h-screen dark-gradient-bg">
                    {isLandingPage ? <LandingNavbar /> : <Navbar />}
                    {!isLandingPage && (
                        <div className="container mx-auto px-4 py-6">
                            {children}
                        </div>
                    )}
                    {isLandingPage && children}
                  </div>
              </BorrowProvider>
            </SupplyProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
}

export default Template