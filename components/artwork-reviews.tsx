"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWallet } from "@/contexts/wallet-context"
import { useFeatures } from "@/contexts/feature-context"
import { toast } from "sonner"
import { Star } from "lucide-react"

interface ArtworkReview {
  id: string
  reviewer: string
  reviewerAddress: string
  content: string
  rating: number
  timestamp: string
}

interface ArtworkReviewsProps {
  artworkId: string
  artworkTitle: string
}

// Mock reviews for demonstration purposes
const mockReviews: ArtworkReview[] = [
  {
    id: "1",
    reviewer: "CryptoArtFan",
    reviewerAddress: "0x1234...abcd",
    content: "This piece has incredible depth and the color palette is mesmerizing.",
    rating: 5,
    timestamp: "2025-06-20T14:28:00Z"
  },
  {
    id: "2",
    reviewer: "NFTCollector",
    reviewerAddress: "0xabcd...1234",
    content: "Innovative and thought-provoking. The artist's technique really shines through.",
    rating: 4,
    timestamp: "2025-06-21T09:15:00Z"
  }
]

export function ArtworkReviews({ artworkId, artworkTitle }: ArtworkReviewsProps) {
  const { isConnected, connectWallet, walletAddress } = useWallet()
  const { features } = useFeatures()
  const [reviews, setReviews] = useState<ArtworkReview[]>(mockReviews)
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If the artwork reviews feature is not enabled, don't render the component
  if (!features.enableArtworkReviews) {
    return null
  }

  const handleAddReview = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to leave a review")
      return
    }

    if (!newReview.trim()) {
      toast.error("Please enter a review")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would call an API to save the review
      // For now, we'll just add it to our local state
      const newReviewObj: ArtworkReview = {
        id: Date.now().toString(),
        reviewer: walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Anonymous",
        reviewerAddress: walletAddress || "0x0000",
        content: newReview,
        rating,
        timestamp: new Date().toISOString()
      }

      setReviews([newReviewObj, ...reviews])
      setNewReview("")
      toast.success("Review submitted successfully")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ count }: { count: number }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artwork Reviews</CardTitle>
        <CardDescription>See what collectors think about "{artworkTitle}"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No reviews yet. Be the first to review this artwork!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{review.reviewer.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.reviewer}</div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <StarRating count={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm">{review.content}</p>
            </div>
          ))
        )}

        {isConnected ? (
          <div className="space-y-4 border-t pt-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="font-medium mr-2">Your Rating:</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 cursor-pointer ${
                        star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Share your thoughts about this artwork..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleAddReview} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        ) : (
          <div className="border-t pt-4">
            <Button onClick={connectWallet} variant="outline" className="w-full">
              Connect Wallet to Leave a Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
