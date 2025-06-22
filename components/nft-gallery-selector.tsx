"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import Image from "next/image"

interface NFT {
  tokenId: string
  contractAddress: string
  name: string
  description: string
  image: string
  collection: string
}

interface NFTGallerySelectorProps {
  onNFTSelect: (nft: NFT) => void
  selectedNFT: NFT | null
}

export function NFTGallerySelector({ onNFTSelect, selectedNFT }: NFTGallerySelectorProps) {
  const { walletAddress, isConnected } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserNFTs = async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)

    try {
      // Mock NFT data - in real implementation, this would call an NFT API like Alchemy or Moralis
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      const mockNFTs: NFT[] = [
        {
          tokenId: "123",
          contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
          name: "Bored Ape #123",
          description: "A unique Bored Ape NFT",
          image: "/placeholder.svg?height=300&width=300",
          collection: "Bored Ape Yacht Club",
        },
        {
          tokenId: "456",
          contractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
          name: "Mutant Ape #456",
          description: "A mutant ape from the lab",
          image: "/placeholder.svg?height=300&width=300",
          collection: "Mutant Ape Yacht Club",
        },
        {
          tokenId: "789",
          contractAddress: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
          name: "Azuki #789",
          description: "A beautiful Azuki character",
          image: "/placeholder.svg?height=300&width=300",
          collection: "Azuki",
        },
        {
          tokenId: "101",
          contractAddress: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
          name: "Doodle #101",
          description: "A colorful doodle NFT",
          image: "/placeholder.svg?height=300&width=300",
          collection: "Doodles",
        },
      ]

      setNfts(mockNFTs)
    } catch (err) {
      setError("Failed to fetch your NFTs. Please try again.")
      console.error("Error fetching NFTs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchUserNFTs()
    }
  }, [isConnected, walletAddress])

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Connect your wallet to see your NFTs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Select Your NFT</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchUserNFTs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your NFTs...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchUserNFTs}>Try Again</Button>
          </div>
        )}

        {!loading && !error && nfts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No NFTs found in your wallet</p>
          </div>
        )}

        {!loading && !error && nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card
                key={`${nft.contractAddress}-${nft.tokenId}`}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedNFT?.tokenId === nft.tokenId && selectedNFT?.contractAddress === nft.contractAddress
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => onNFTSelect(nft)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  {selectedNFT?.tokenId === nft.tokenId && selectedNFT?.contractAddress === nft.contractAddress && (
                    <div className="absolute top-2 right-2">
                      <Badge>Selected</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
