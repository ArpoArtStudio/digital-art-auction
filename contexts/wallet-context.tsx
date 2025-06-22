"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"

// Owner wallet address for admin access
const OWNER_WALLET_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0"

// Display name options
export enum DisplayNameOption {
  SHORT_ADDRESS = 'short_address', // 0x1234...5678 format
  FULL_ADDRESS = 'full_address',   // Full wallet address
  ENS = 'ens'                      // ENS name if available, fallback to short address
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayNameOption, setDisplayNameOption] = useState<DisplayNameOption>(
    DisplayNameOption.SHORT_ADDRESS
  )
  const [ensName, setEnsName] = useState<string | null>(null)
  const [availableEnsNames, setAvailableEnsNames] = useState<string[]>([])
  const [hasSetUsername, setHasSetUsername] = useState(false)
  const [usernameChangeRequested, setUsernameChangeRequested] = useState(false)
  const [pendingUsernameRequests, setPendingUsernameRequests] = useState<UsernameChangeRequest[]>([])

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])
  
  // Try to resolve ENS name when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchEnsName(walletAddress)
      
      // Check if user has already set a username
      const storedDisplayOption = localStorage.getItem(`displayNameOption_${walletAddress}`)
      const storedSelectedEns = localStorage.getItem(`selectedEns_${walletAddress}`)
      
      if (storedDisplayOption) {
        setDisplayNameOption(storedDisplayOption as DisplayNameOption)
        setHasSetUsername(true)
        
        if (storedDisplayOption === DisplayNameOption.ENS && storedSelectedEns) {
          setEnsName(storedSelectedEns)
        }
      } else {
        setHasSetUsername(false)
      }
      
      // Check for pending username change requests
      const storedRequest = localStorage.getItem(`usernameChangeRequest_${walletAddress}`)
      if (storedRequest) {
        setUsernameChangeRequested(true)
      } else {
        setUsernameChangeRequested(false)
      }
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
        return ensName || `${walletAddress.substring(0, 5)}`
      case DisplayNameOption.FULL_ADDRESS:
        return walletAddress
      case DisplayNameOption.SHORT_ADDRESS:
      default:
        return `${walletAddress.substring(0, 5)}`
    }
  }, [walletAddress, displayNameOption, ensName])
  
  // Helper function to fetch ENS names if available
  const fetchEnsName = async (address: string) => {
    try {
      // This would normally use the ethers.js provider to resolve ENS
      // For demo purposes we'll simulate it with multiple ENS names for some addresses
      const mockEnsNames: Record<string, string | string[]> = {
        "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0": ["admin.eth", "superadmin.eth", "auction.eth"],
        "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E351b0": "user1.eth",
        "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E352c0": ["collector.eth", "art.eth"]
      }
      
      // Check if we have a mock ENS for this address
      const ensForAddress = mockEnsNames[address]
      if (ensForAddress) {
        if (Array.isArray(ensForAddress)) {
          // If there are multiple ENS names, use the first one for now
          // We'll add a UI to select between them later
          setEnsName(ensForAddress[0])
          
          // Store all ENS names in localStorage for this address
          localStorage.setItem(`ensNames_${address}`, JSON.stringify(ensForAddress))
        } else {
          setEnsName(ensForAddress)
          localStorage.setItem(`ensNames_${address}`, JSON.stringify([ensForAddress]))
        }
      } else {
        setEnsName(null)
        localStorage.removeItem(`ensNames_${address}`)
      }
    } catch (error) {
      console.error("Error fetching ENS name:", error)
      setEnsName(null)
    }
  }

  const checkWalletConnection = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
        setIsAdmin(address.toLowerCase() === OWNER_WALLET_ADDRESS.toLowerCase())
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === "undefined") {
        throw new Error("Wallet connection is only available in the browser")
      }

      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
        setIsAdmin(address.toLowerCase() === OWNER_WALLET_ADDRESS.toLowerCase())
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        setError("Wallet connection was rejected by user")
      } else {
        setError(error.message || "Failed to connect wallet")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setError(null)
    setIsAdmin(false)
  }
  
  // Load all ENS names for the current wallet
  useEffect(() => {
    if (walletAddress) {
      try {
        const storedEnsNames = localStorage.getItem(`ensNames_${walletAddress}`)
        if (storedEnsNames) {
          const names = JSON.parse(storedEnsNames)
          setAvailableEnsNames(Array.isArray(names) ? names : [names])
        } else {
          setAvailableEnsNames([])
        }
        
        // Load admin pending username requests
        if (isAdmin) {
          const pendingRequestsJson = localStorage.getItem('pendingUsernameRequests')
          if (pendingRequestsJson) {
            setPendingUsernameRequests(JSON.parse(pendingRequestsJson))
          }
        }
      } catch (e) {
        console.error("Error loading ENS names:", e)
        setAvailableEnsNames([])
      }
    }
  }, [walletAddress, isAdmin])
  
  // Select username function for first-time setup or post-approval change
  const selectUsername = (option: DisplayNameOption, selectedEns?: string) => {
    if (!walletAddress) return
    
    setDisplayNameOption(option)
    localStorage.setItem(`displayNameOption_${walletAddress}`, option)
    
    if (option === DisplayNameOption.ENS && selectedEns) {
      setEnsName(selectedEns)
      localStorage.setItem(`selectedEns_${walletAddress}`, selectedEns)
    }
    
    setHasSetUsername(true)
    
    // Remove any pending request if this is an approved change
    localStorage.removeItem(`usernameChangeRequest_${walletAddress}`)
    setUsernameChangeRequested(false)
    
    // Also update pending requests list for admins
    if (pendingUsernameRequests.length > 0) {
      const updatedRequests = pendingUsernameRequests.filter(req => req.walletAddress !== walletAddress)
      setPendingUsernameRequests(updatedRequests)
      localStorage.setItem('pendingUsernameRequests', JSON.stringify(updatedRequests))
    }
  }
  
  // Request username change
  const requestUsernameChange = () => {
    if (!walletAddress || !hasSetUsername) return
    
    const request: UsernameChangeRequest = {
      walletAddress,
      currentName: displayName,
      requestedName: "", // Will be filled in UI when user selects
      requestedAt: Date.now(),
      approved: false
    }
    
    // Store the request locally
    localStorage.setItem(`usernameChangeRequest_${walletAddress}`, JSON.stringify(request))
    setUsernameChangeRequested(true)
    
    // Add to pending requests for admins
    const pendingRequestsJson = localStorage.getItem('pendingUsernameRequests')
    let pendingRequests: UsernameChangeRequest[] = []
    
    if (pendingRequestsJson) {
      pendingRequests = JSON.parse(pendingRequestsJson)
    }
    
    pendingRequests.push(request)
    localStorage.setItem('pendingUsernameRequests', JSON.stringify(pendingRequests))
    
    // In a real app, we would send this to a server
  }
  
  // Admin: approve username change request
  const approveUsernameChange = (requesterWalletAddress: string) => {
    if (!isAdmin) return
    
    const updatedRequests = pendingUsernameRequests.map(req => {
      if (req.walletAddress === requesterWalletAddress) {
        return { ...req, approved: true }
      }
      return req
    })
    
    setPendingUsernameRequests(updatedRequests)
    localStorage.setItem('pendingUsernameRequests', JSON.stringify(updatedRequests))
    
    // In a real app, we would send this to a server and notify the user
  }
  
  // Admin: reject username change request
  const rejectUsernameChange = (requesterWalletAddress: string) => {
    if (!isAdmin) return
    
    const updatedRequests = pendingUsernameRequests.filter(req => req.walletAddress !== requesterWalletAddress)
    
    setPendingUsernameRequests(updatedRequests)
    localStorage.setItem('pendingUsernameRequests', JSON.stringify(updatedRequests))
    localStorage.removeItem(`usernameChangeRequest_${requesterWalletAddress}`)
    
    // In a real app, we would send this to a server and notify the user
  }

  return (
    <WalletContext.Provider
      value={{
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
        rejectUsernameChange
      }}
    >
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

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
}
