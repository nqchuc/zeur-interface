"use client"
import { usePathname } from 'next/navigation'
import React from 'react'
import LandingNavbar from '../components/navbar/LandingNavbar'
import Navbar from '../components/navbar/Navbar'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/config/wagmiConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupplyProvider } from '@/hooks/contexts/SupplyHookContext'
import { BorrowProvider } from '@/hooks/contexts/BorrowHookContext'
import { Toaster } from "@/components/ui/toaster"
import {
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';


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
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          fontStack: 'system',
          overlayBlur: 'small',
        })}  >
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
                    <Toaster />
                  </div>
              </BorrowProvider>
          </SupplyProvider>
        </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
}

export default Template