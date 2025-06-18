"use client"
import { usePathname } from 'next/navigation'
import React from 'react'
import LandingNavbar from './LandingNavbar'
import Navbar from './Navbar'

function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLandingPage = pathname === "/"
    return (
        <div className="min-h-screen dark-gradient-bg">
        {isLandingPage ? <LandingNavbar /> : <Navbar />}
        {!isLandingPage && (
        <div className="container mx-auto px-4 py-6">
            {children}
        </div>
        )}
        {isLandingPage && children}
        </div>
    )
}

export default LayoutContent