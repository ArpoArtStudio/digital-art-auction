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
  return getEthereumProvider() !== null;
}

/**
 * Safely request from ethereum provider
 */
export async function safeEthereumRequest(method: string, params?: any[]): Promise<any> {
  const provider = getEthereumProvider();
  
  if (!provider) {
    throw new Error("No Ethereum provider available");
  }

  try {
    return await provider.request({ method, params });
  } catch (error) {
    console.error(`Error with ethereum request ${method}:`, error);
    throw error;
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
    return await safeEthereumRequest("eth_requestAccounts");
  } catch (error) {
    console.error("Error requesting wallet connection:", error);
    throw error;
  }
}
