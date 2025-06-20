"use client"
import { usePathname } from 'next/navigation'
import React from 'react'
import LandingNavbar from './LandingNavbar'
import Navbar from './Navbar'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmiConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function LayoutContent({
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
                <div className="min-h-screen dark-gradient-bg">
                {isLandingPage ? <LandingNavbar /> : <Navbar />}
                {!isLandingPage && (
                    <div className="container mx-auto px-4 py-6">
                        {children}
                    </div>
                )}
                {isLandingPage && children}
            </div>
        </QueryClientProvider>
      </WagmiProvider>
    )
}

export default LayoutContent