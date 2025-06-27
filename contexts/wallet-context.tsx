"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useFeatures } from "./feature-context"
import { DatabaseService } from "@/lib/database"
import type { Tables } from "@/lib/supabase"
import { 
  getEthereumProvider, 
  isWalletAvailable, 
  getWalletAccounts, 
  requestWalletConnection,
  isMetaMaskLocked
} from "@/lib/ethereum-provider"

// Default admin wallet address
const DEFAULT_ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0"

// Display name options (updated to match database enum)
export enum DisplayNameOption {
  WALLET = 'wallet',
  ENS = 'ens',
  USERNAME = 'username'
}

interface UsernameChangeRequest {
  walletAddress: string;
  currentName: string;
  requestedName: string;
  requestedAt: number;
  approved: boolean;
}

interface WalletContextType {
  isConnected: boolean
  walletAddress: string
  isLoading: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  error: string | null
  isAdmin: boolean
  displayNameOption: DisplayNameOption
  setDisplayNameOption: (option: DisplayNameOption) => void
  displayName: string
  ensName: string | null
  hasSetUsername: boolean
  availableEnsNames: string[]
  usernameChangeRequested: boolean
  requestUsernameChange: () => void
  selectUsername: (option: DisplayNameOption, ensName?: string) => void
  pendingUsernameRequests: UsernameChangeRequest[]
  approveUsernameChange: (walletAddress: string) => void
  rejectUsernameChange: (walletAddress: string) => void
  user: Tables<'users'> | null
  updateUserProfile: (updates: Partial<Tables<'users'>>) => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayNameOption, setDisplayNameOption] = useState<DisplayNameOption>(
    DisplayNameOption.WALLET
  )
  const [ensName, setEnsName] = useState<string | null>(null)
  const [availableEnsNames, setAvailableEnsNames] = useState<string[]>([])
  const [hasSetUsername, setHasSetUsername] = useState(false)
  const [usernameChangeRequested, setUsernameChangeRequested] = useState(false)
  const [pendingUsernameRequests, setPendingUsernameRequests] = useState<UsernameChangeRequest[]>([])
  
  // New Supabase state
  const [user, setUser] = useState<Tables<'users'> | null>(null)
  const [adminWallets, setAdminWallets] = useState<string[]>([DEFAULT_ADMIN_WALLET])

  // Load user from database when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadUserFromDatabase(walletAddress)
    } else {
      setUser(null)
    }
  }, [walletAddress])

  const loadUserFromDatabase = async (address: string) => {
    try {
      let userData = await DatabaseService.getUserByWallet(address)
      
      if (!userData) {
        // Create new user if doesn't exist
        userData = await DatabaseService.createUser({
          wallet_address: address,
          display_name_option: 'wallet',
          user_level: 'L1',
          bid_count: 0,
          total_bid_amount: 0,
          is_active: true,
          is_banned: false
        })
      }
      
      setUser(userData)
      setDisplayNameOption(userData.display_name_option as DisplayNameOption)
      setEnsName(userData.ens_name)
      setHasSetUsername(userData.display_name_option !== 'wallet')
      
    } catch (error) {
      console.error('Failed to load user from database:', error)
      setError('Failed to load user data')
    }
  }

  const updateUserProfile = async (updates: Partial<Tables<'users'>>) => {
    if (!user) return
    
    try {
      const updatedUser = await DatabaseService.updateUser(user.id, updates)
      setUser(updatedUser)
      
      // Update local state if display options changed
      if (updates.display_name_option) {
        setDisplayNameOption(updates.display_name_option as DisplayNameOption)
      }
      if (updates.ens_name !== undefined) {
        setEnsName(updates.ens_name)
      }
      
    } catch (error) {
      console.error('Failed to update user profile:', error)
      setError('Failed to update profile')
    }
  }

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])
  
  // Check if the connected wallet is an admin wallet when either changes
  useEffect(() => {
    if (walletAddress && adminWallets.length > 0) {
      const isAdminWallet = adminWallets.some(
        adminWallet => adminWallet.toLowerCase() === walletAddress.toLowerCase()
      )
      setIsAdmin(isAdminWallet)
    } else {
      setIsAdmin(false)
    }
  }, [walletAddress, adminWallets])
  
  // Try to resolve ENS name when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchEnsName(walletAddress)
    } else {
      setEnsName(null)
      setAvailableEnsNames([])
      setHasSetUsername(false)
      setUsernameChangeRequested(false)
    }
  }, [walletAddress])

  // Get formatted display name based on selected option
  const displayName = useMemo(() => {
    if (!walletAddress) return ""
    
    switch (displayNameOption) {
      case DisplayNameOption.ENS:
        return ensName || `${walletAddress.substring(0, 6)}...`
      case DisplayNameOption.USERNAME:
        return user?.username || `${walletAddress.substring(0, 6)}...`
      case DisplayNameOption.WALLET:
      default:
        return `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    }
  }, [displayNameOption, ensName, user?.username, walletAddress])

  async function checkWalletConnection() {
    try {
      if (!isWalletAvailable()) {
        return
      }

      const accounts = await getWalletAccounts()
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  async function connectWallet() {
    setIsLoading(true)
    setError(null)

    try {
      if (!isWalletAvailable()) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      const isLocked = await isMetaMaskLocked()
      if (isLocked) {
        throw new Error("MetaMask is locked. Please unlock your wallet and try again.")
      }

      const accounts = await requestWalletConnection()
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
      } else {
        throw new Error("No accounts found. Please check your wallet connection.")
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }

  function disconnectWallet() {
    setIsConnected(false)
    setWalletAddress("")
    setUser(null)
    setEnsName(null)
    setAvailableEnsNames([])
    setHasSetUsername(false)
    setUsernameChangeRequested(false)
    setIsAdmin(false)
    setError(null)
  }

  async function fetchEnsName(address: string) {
    try {
      const provider = getEthereumProvider()
      if (!provider) return

      // Try to resolve ENS name
      const ensName = await provider.lookupAddress?.(address)
      if (ensName) {
        setEnsName(ensName)
        setAvailableEnsNames([ensName])
      }
    } catch (error) {
      console.error("Error fetching ENS name:", error)
    }
  }

  function requestUsernameChange() {
    if (!walletAddress) return

    const request: UsernameChangeRequest = {
      walletAddress,
      currentName: displayName,
      requestedName: "Custom Username",
      requestedAt: Date.now(),
      approved: false
    }

    // Store request in localStorage for now (could be moved to database)
    localStorage.setItem(`usernameChangeRequest_${walletAddress}`, JSON.stringify(request))
    setUsernameChangeRequested(true)
  }

  async function selectUsername(option: DisplayNameOption, ensName?: string) {
    if (!user) return

    const updates: Partial<Tables<'users'>> = {
      display_name_option: option
    }

    if (option === DisplayNameOption.ENS && ensName) {
      updates.ens_name = ensName
    }

    await updateUserProfile(updates)
    setHasSetUsername(true)
  }

  function approveUsernameChange(walletAddress: string) {
    // Implementation for admin approval
    localStorage.removeItem(`usernameChangeRequest_${walletAddress}`)
    setPendingUsernameRequests(prev => 
      prev.filter(req => req.walletAddress !== walletAddress)
    )
  }

  function rejectUsernameChange(walletAddress: string) {
    // Implementation for admin rejection
    localStorage.removeItem(`usernameChangeRequest_${walletAddress}`)
    setPendingUsernameRequests(prev => 
      prev.filter(req => req.walletAddress !== walletAddress)
    )
  }

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    isLoading,
    connectWallet,
    disconnectWallet,
    error,
    isAdmin,
    displayNameOption,
    setDisplayNameOption,
    displayName,
    ensName,
    hasSetUsername,
    availableEnsNames,
    usernameChangeRequested,
    requestUsernameChange,
    selectUsername,
    pendingUsernameRequests,
    approveUsernameChange,
    rejectUsernameChange,
    user,
    updateUserProfile
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
