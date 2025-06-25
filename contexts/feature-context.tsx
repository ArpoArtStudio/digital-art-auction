"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define the interface for feature toggles
export interface FeatureToggles {
  enableEmailNotifications: boolean
  enableAutomaticAuctionStart: boolean
  enableNFTRoyalties: boolean
  enablePublicArtistProfiles: boolean
  enableCuratedMode: boolean
  enableArtworkReviews: boolean
}

// Define the default state for feature toggles
const defaultFeatureToggles: FeatureToggles = {
  enableEmailNotifications: true,
  enableAutomaticAuctionStart: false,
  enableNFTRoyalties: true,
  enablePublicArtistProfiles: true,
  enableCuratedMode: false,
  enableArtworkReviews: false
}

// Define the interface for wallets settings
export interface WalletSettings {
  escrowWalletAddress: string
  platformWalletAddress: string
}

// Define default wallet settings
const defaultWalletSettings: WalletSettings = {
  escrowWalletAddress: "0xEscrow123456789abcdef",
  platformWalletAddress: "0xPlatform987654321fedcba",
}

interface FeatureContextType {
  features: FeatureToggles
  walletSettings: WalletSettings
  updateFeatures: (features: Partial<FeatureToggles>) => void
  updateWalletSettings: (settings: Partial<WalletSettings>) => void
  isFeatureEnabled: (featureName: keyof FeatureToggles) => boolean
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined)

// Create a hook to use the feature context
export function useFeatures() {
  const context = useContext(FeatureContext)
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider')
  }
  return context
}

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureToggles>(defaultFeatureToggles)
  const [walletSettings, setWalletSettings] = useState<WalletSettings>(defaultWalletSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      // Load feature toggles
      const storedFeatures = localStorage.getItem('featureToggles')
      if (storedFeatures) {
        setFeatures(JSON.parse(storedFeatures))
      }

      // Load wallet settings
      const storedWalletSettings = localStorage.getItem('walletSettings')
      if (storedWalletSettings) {
        setWalletSettings(JSON.parse(storedWalletSettings))
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
    }
  }, [])

  // Update feature toggles
  const updateFeatures = (newFeatures: Partial<FeatureToggles>) => {
    const updatedFeatures = { ...features, ...newFeatures }
    setFeatures(updatedFeatures)
    localStorage.setItem('featureToggles', JSON.stringify(updatedFeatures))
  }

  // Update wallet settings
  const updateWalletSettings = (newSettings: Partial<WalletSettings>) => {
    const updatedSettings = { ...walletSettings, ...newSettings }
    setWalletSettings(updatedSettings)
    localStorage.setItem('walletSettings', JSON.stringify(updatedSettings))
  }

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureName: keyof FeatureToggles): boolean => {
    return features[featureName]
  }

  return (
    <FeatureContext.Provider value={{
      features,
      walletSettings,
      updateFeatures,
      updateWalletSettings,
      isFeatureEnabled
    }}>
      {children}
    </FeatureContext.Provider>
  )
}
