/**
 * Ethereum provider detection utility
 * Handles multiple wallet extensions gracefully
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Safely get the ethereum provider
 * Returns null if not available or if there are conflicts
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Check if ethereum exists and is accessible
    if (window.ethereum && typeof window.ethereum.request === "function") {
      return window.ethereum;
    }
  } catch (error) {
    console.warn("Error accessing ethereum provider:", error);
  }

  return null;
}

/**
 * Check if a wallet is available
 */
export function isWalletAvailable(): boolean {
  const provider = getEthereumProvider();
  return provider !== null;
}

/**
 * Safely request from ethereum provider
 */
export async function safeEthereumRequest(method: string, params?: any[]): Promise<any> {
  const provider = getEthereumProvider();
  
  if (!provider) {
    throw new Error("No Ethereum provider available. Please install MetaMask or another wallet.");
  }

  try {
    const result = await provider.request({ method, params });
    return result;
  } catch (error: any) {
    console.error(`Error with ethereum request ${method}:`, error);
    
    // Handle specific wallet error codes
    if (error.code === 4001) {
      throw new Error("User rejected the request");
    } else if (error.code === -32002) {
      throw new Error("Request already pending. Please check your wallet.");
    } else if (error.code === -32603) {
      throw new Error("Internal error. Please try again.");
    } else if (error.message?.includes("User denied")) {
      throw new Error("User denied the request");
    } else if (error.message?.includes("MetaMask")) {
      throw new Error("MetaMask error: " + error.message);
    }
    
    // Re-throw with more context
    throw new Error(`Wallet request failed: ${error.message || error.toString()}`);
  }
}

/**
 * Get wallet accounts safely
 */
export async function getWalletAccounts(): Promise<string[]> {
  try {
    return await safeEthereumRequest("eth_accounts");
  } catch (error) {
    console.error("Error getting wallet accounts:", error);
    return [];
  }
}

/**
 * Request wallet connection safely
 */
export async function requestWalletConnection(): Promise<string[]> {
  try {
    // First check if we already have accounts (user previously connected)
    const existingAccounts = await safeEthereumRequest("eth_accounts");
    if (existingAccounts.length > 0) {
      return existingAccounts;
    }
    
    // No existing connection, request new connection
    return await safeEthereumRequest("eth_requestAccounts");
  } catch (error) {
    console.error("Error requesting wallet connection:", error);
    throw error;
  }
}

/**
 * Check if MetaMask is locked
 */
export async function isMetaMaskLocked(): Promise<boolean> {
  try {
    const provider = getEthereumProvider();
    if (!provider || !provider.isMetaMask) {
      return false; // Not MetaMask, so not locked
    }
    
    const accounts = await provider.request({ method: "eth_accounts" });
    return accounts.length === 0;
  } catch (error) {
    console.warn("Could not check MetaMask lock status:", error);
    return true; // Assume locked if we can't check
  }
}
