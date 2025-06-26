"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export function WalletDebugger() {
  const [debugInfo, setDebugInfo] = useState<{
    hasWindow: boolean
    hasEthereum: boolean
    isMetaMask: boolean
    accounts: string[]
    error: string | null
    provider: any
  }>({
    hasWindow: false,
    hasEthereum: false,
    isMetaMask: false,
    accounts: [],
    error: null,
    provider: null
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkWalletEnvironment()
  }, [])

  const checkWalletEnvironment = () => {
    try {
      const hasWindow = typeof window !== "undefined"
      const hasEthereum = hasWindow && typeof window.ethereum !== "undefined"
      const isMetaMask = hasEthereum && window.ethereum?.isMetaMask === true
      const provider = hasEthereum ? window.ethereum : null

      setDebugInfo({
        hasWindow,
        hasEthereum,
        isMetaMask,
        accounts: [],
        error: null,
        provider
      })
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        error: error.message || "Unknown error during environment check"
      }))
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found")
      }

      console.log("Testing wallet connection...");

      // First try to get existing accounts
      const existingAccounts = await window.ethereum.request({
        method: "eth_accounts"
      })

      if (existingAccounts.length > 0) {
        console.log("Found existing accounts:", existingAccounts);
        setDebugInfo(prev => ({
          ...prev,
          accounts: existingAccounts,
          error: null
        }))
      } else {
        console.log("No existing accounts, requesting connection...");
        // Request new connection
        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        })

        console.log("Connection successful! Accounts:", newAccounts);
        setDebugInfo(prev => ({
          ...prev,
          accounts: newAccounts,
          error: null
        }))
      }
    } catch (error: any) {
      console.error("Connection test error:", error)
      let errorMessage = "Connection failed";
      
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDebugInfo(prev => ({
        ...prev,
        error: errorMessage
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  )

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Wallet Connection Debugger
        </CardTitle>
        <CardDescription>
          Debug wallet connection issues and test MetaMask integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Checks */}
        <div className="space-y-2">
          <h3 className="font-semibold">Environment Checks:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon condition={debugInfo.hasWindow} />
              <span>Browser Window Available: {debugInfo.hasWindow ? "✓" : "✗"}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon condition={debugInfo.hasEthereum} />
              <span>Ethereum Provider Available: {debugInfo.hasEthereum ? "✓" : "✗"}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon condition={debugInfo.isMetaMask} />
              <span>MetaMask Detected: {debugInfo.isMetaMask ? "✓" : "✗"}</span>
            </div>
          </div>
        </div>

        {/* Provider Details */}
        {debugInfo.hasEthereum && (
          <div className="space-y-2">
            <h3 className="font-semibold">Provider Details:</h3>
            <div className="text-sm bg-muted p-2 rounded">
              <pre>{JSON.stringify({
                isMetaMask: debugInfo.provider?.isMetaMask,
                chainId: debugInfo.provider?.chainId,
                networkVersion: debugInfo.provider?.networkVersion,
              }, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {debugInfo.accounts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Connected Accounts:</h3>
            <div className="space-y-1">
              {debugInfo.accounts.map((account, index) => (
                <div key={index} className="text-sm bg-green-50 p-2 rounded">
                  {account}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {debugInfo.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {debugInfo.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={checkWalletEnvironment} variant="outline">
            Refresh Environment Check
          </Button>
          <Button 
            onClick={testConnection} 
            disabled={!debugInfo.hasEthereum || isLoading}
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Make sure MetaMask is installed in your browser</li>
            <li>2. Refresh the page after installing MetaMask</li>
            <li>3. Check if MetaMask is unlocked</li>
            <li>4. Try disabling other wallet extensions temporarily</li>
            <li>5. Check browser console for additional error messages</li>
          </ul>
          
          {!debugInfo.hasEthereum && (
            <div className="mt-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                → Download MetaMask
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
