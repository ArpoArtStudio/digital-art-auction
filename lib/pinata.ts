interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface ArtworkMetadata {
  name: string
  description: string
  image: string
  artist: string
  createdAt: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export class PinataService {
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud'
  private static readonly PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs'

  private static getHeaders() {
    const apiKey = process.env.PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_API_KEY

    if (!apiKey || !secretKey) {
      throw new Error('Live Pinata API keys are required. Please set up your Pinata account and update environment variables.')
    }

    return {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey,
    }
  }

  /**
   * Upload an image file to IPFS via Pinata
   */
  static async uploadImage(file: File, name: string): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const metadata = JSON.stringify({
        name: `artwork-image-${name}`,
        keyvalues: {
          type: 'artwork-image',
          uploaded: new Date().toISOString()
        }
      })
      formData.append('pinataMetadata', metadata)

      const options = JSON.stringify({
        cidVersion: 1,
      })
      formData.append('pinataOptions', options)

      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`)
      }

      const result: PinataResponse = await response.json()
      return result.IpfsHash
    } catch (error) {
      console.error('Error uploading image to Pinata:', error)
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Upload artwork metadata to IPFS via Pinata
   */
  static async uploadMetadata(metadata: ArtworkMetadata): Promise<string> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders(),
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `artwork-metadata-${metadata.name}`,
            keyvalues: {
              type: 'artwork-metadata',
              artist: metadata.artist,
              uploaded: new Date().toISOString()
            }
          },
          pinataOptions: {
            cidVersion: 1,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to upload metadata: ${response.statusText}`)
      }

      const result: PinataResponse = await response.json()
      return result.IpfsHash
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error)
      throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create complete NFT metadata and upload both image and metadata
   */
  static async createNFT(
    imageFile: File, 
    artworkData: {
      title: string
      description: string
      artistName: string
      attributes?: Array<{ trait_type: string; value: string | number }>
    }
  ): Promise<{ imageHash: string; metadataHash: string; metadataUrl: string }> {
    try {
      // Upload image first
      const imageHash = await this.uploadImage(imageFile, artworkData.title)
      const imageUrl = `${this.PINATA_GATEWAY_URL}/${imageHash}`

      // Create metadata
      const metadata: ArtworkMetadata = {
        name: artworkData.title,
        description: artworkData.description,
        image: imageUrl,
        artist: artworkData.artistName,
        createdAt: new Date().toISOString(),
        attributes: artworkData.attributes || []
      }

      // Upload metadata
      const metadataHash = await this.uploadMetadata(metadata)
      const metadataUrl = `${this.PINATA_GATEWAY_URL}/${metadataHash}`

      return {
        imageHash,
        metadataHash,
        metadataUrl
      }
    } catch (error) {
      console.error('Error creating NFT:', error)
      throw new Error(`Failed to create NFT: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  static getIpfsUrl(hash: string): string {
    return `${this.PINATA_GATEWAY_URL}/${hash}`
  }

  /**
   * Test Pinata connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/data/testAuthentication`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      return response.ok
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }

  /**
   * Get pin list (for debugging/admin purposes)
   */
  static async getPinList(limit = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/data/pinList?pageLimit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to get pin list: ${response.statusText}`)
      }

      const result = await response.json()
      return result.rows || []
    } catch (error) {
      console.error('Error getting pin list:', error)
      throw new Error(`Failed to get pin list: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Unpin content from IPFS (admin function)
   */
  static async unpinContent(hash: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/pinning/unpin/${hash}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      return response.ok
    } catch (error) {
      console.error('Error unpinning content:', error)
      return false
    }
  }
}
