"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useFeatures } from "./feature-context"
import { 
  getEthereumProvider, 
  isWalletAvailable, 
  getWalletAccounts, 
  requestWalletConnection 
} from "@/lib/ethereum-provider"

// Default admin wallet address
const DEFAULT_ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0"

// Display name options
export enum DisplayNameOption {
  FIRST_5 = 'first_5',           // First 5 characters (0x123...)
  LAST_5 = 'last_5',             // Last 5 characters (...5678)
  ENS = 'ens'                    // ENS name if available
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
  // Note: We're not directly using useFeatures() here because the FeatureProvider might not be available yet
  // We'll check for platform wallet settings later when they become available
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayNameOption, setDisplayNameOption] = useState<DisplayNameOption>(
    DisplayNameOption.FIRST_5
  )
  const [ensName, setEnsName] = useState<string | null>(null)
  const [availableEnsNames, setAvailableEnsNames] = useState<string[]>([])
  const [hasSetUsername, setHasSetUsername] = useState(false)
  const [usernameChangeRequested, setUsernameChangeRequested] = useState(false)
  const [pendingUsernameRequests, setPendingUsernameRequests] = useState<UsernameChangeRequest[]>([])
  // Store admin wallets list
  const [adminWallets, setAdminWallets] = useState<string[]>([DEFAULT_ADMIN_WALLET])

  // Load admin wallets from localStorage on mount
  useEffect(() => {
    const storedAdminWallets = localStorage.getItem('adminWallets')
    if (storedAdminWallets) {
      try {
        const parsedWallets = JSON.parse(storedAdminWallets)
        if (Array.isArray(parsedWallets) && parsedWallets.length > 0) {
          setAdminWallets(parsedWallets)
        }
      } catch (e) {
        console.error("Error parsing admin wallets:", e)
        // Fall back to default admin wallet
      }
    }
  }, [])

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
        return ensName || `${walletAddress.substring(0, 5)}...`
      case DisplayNameOption.LAST_5:
        return `...${walletAddress.substring(walletAddress.length - 5)}`
      case DisplayNameOption.FIRST_5:
      default:
        return `${walletAddress.substring(0, 5)}...`
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
          // Multiple ENS names available
          setAvailableEnsNames(ensForAddress)
          
          // Check if user has already selected one
          const selectedEns = localStorage.getItem(`selectedEns_${address}`)
          if (selectedEns && ensForAddress.includes(selectedEns)) {
            setEnsName(selectedEns)
          } else {
            // No selection made yet, don't set an ENS name
            setEnsName(null)
          }
        } else {
          // Single ENS name
          setEnsName(ensForAddress)
          setAvailableEnsNames([ensForAddress])
        }
      } else {
        setEnsName(null)
        setAvailableEnsNames([])
      }
    } catch (error) {
      console.error("Error fetching ENS name:", error)
      setEnsName(null)
      setAvailableEnsNames([])
    }
  }

  const checkWalletConnection = async () => {
    if (!isWalletAvailable()) {
      return
    }

    try {
      const accounts = await getWalletAccounts()
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
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

      if (!isWalletAvailable()) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.")
      }

      const accounts = await requestWalletConnection()

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
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
          } else {
            // For demo purposes, create some sample username change requests
            const sampleRequests: UsernameChangeRequest[] = [
              {
                walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                currentName: '0x742d...',
                requestedName: 'collector.eth',
                requestedAt: Date.now() - 3600000, // 1 hour ago
                approved: false
              },
              {
                walletAddress: '0x983e0DAB5dC8CcE1Ca3B77fb901fE73927e8cB0f',
                currentName: '0x983e...',
                requestedName: 'artist.eth',
                requestedAt: Date.now() - 86400000, // 1 day ago
                approved: false
              }
            ];
            setPendingUsernameRequests(sampleRequests);
            localStorage.setItem('pendingUsernameRequests', JSON.stringify(sampleRequests));
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
