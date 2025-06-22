"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "@/contexts/wallet-context"
import { auctionContract, PaymentStatus } from "@/lib/auction-contract"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface PaymentCompletionProps {
  auctionId: string
  artworkName: string
  artworkImage?: string
  bidAmount: string
  depositAmount?: string
  paymentDeadline: Date
}

export function PaymentCompletion({
  auctionId,
  artworkName,
  artworkImage,
  bidAmount,
  depositAmount = "0.01",
  paymentDeadline
}: PaymentCompletionProps) {
  const { walletAddress, isConnected, connectWallet } = useWallet()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false)

  // Calculate amounts
  const bidAmountNum = parseFloat(bidAmount)
  const depositAmountNum = parseFloat(depositAmount)
  const remainingAmount = bidAmountNum - depositAmountNum
  
  // Calculate time remaining
  const timeRemaining = paymentDeadline.getTime() - Date.now()
  const timeRemainingPercentage = Math.max(Math.min((timeRemaining / (24 * 60 * 60 * 1000)) * 100, 100), 0)
  const hasExpired = timeRemaining <= 0

  // Fetch payment status
  useEffect(() => {
    const getStatus = async () => {
      if (!isConnected) return
      
      try {
        setIsLoading(true)
        const status = await auctionContract.getPaymentStatus(auctionId, walletAddress)
        setPaymentStatus(status)
      } catch (error) {
        console.error("Error fetching payment status:", error)
        toast.error("Could not fetch payment status")
      } finally {
        setIsLoading(false)
      }
    }

    getStatus()
    // Refresh every minute
    const interval = setInterval(getStatus, 60000)
    return () => clearInterval(interval)
  }, [auctionId, walletAddress, isConnected])

  // Handle payment completion
  const handleCompletePayment = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to complete payment")
      connectWallet()
      return
    }
    
    setIsProcessing(true)
    
    try {
      const success = await auctionContract.completePayment(auctionId)
      
      if (success) {
        toast.success("Payment completed successfully!")
        setPaymentStatus(PaymentStatus.Completed)
        setShowPaymentDialog(false)
      } else {
        toast.error("Failed to complete payment. Please try again.")
      }
    } catch (error) {
      console.error("Error completing payment:", error)
      toast.error("An error occurred while processing your payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusUI = () => {
    if (isLoading) {
      return <Skeleton className="h-10 w-28" />
    }
    
    switch (paymentStatus) {
      case PaymentStatus.Completed:
        return (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Payment Completed</span>
          </div>
        )
        
      case PaymentStatus.Pending:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Payment Due</span>
            </div>
            
            {!hasExpired ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatDistanceToNow(paymentDeadline)}</span>
                </div>
                <Progress value={timeRemainingPercentage} className="h-2" />
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Payment Deadline Expired</AlertTitle>
                <AlertDescription>
                  You've missed the payment deadline. Your deposit will be forfeited.
                </AlertDescription>
              </Alert>
            )}
            
            {!hasExpired && (
              <Button 
                className="w-full"
                onClick={() => setShowPaymentDialog(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Payment
              </Button>
            )}
          </div>
        )
        
      case PaymentStatus.Expired:
        return (
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Payment Expired</span>
          </div>
        )
        
      case PaymentStatus.NotRequired:
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">No Payment Required</span>
          </div>
        )
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            You won the auction for {artworkName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {artworkImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <img 
                src={artworkImage} 
                alt={artworkName} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total bid amount:</span>
                <span className="font-medium">{bidAmount} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial deposit:</span>
                <span className="font-medium">{depositAmount} ETH</span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                <span>Amount due:</span>
                <span>{remainingAmount.toFixed(2)} ETH</span>
              </div>
            </div>
            
            <div className="pt-2">
              {getStatusUI()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Completion Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Please confirm the payment for your winning bid on {artworkName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </AlertTitle>
              <AlertDescription className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Artwork:</span>
                  <span className="font-medium">{artworkName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bid amount:</span>
                  <span>{bidAmount} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deposit paid:</span>
                  <span>{depositAmount} ETH</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2">
                  <span>Amount to pay now:</span>
                  <span>{remainingAmount.toFixed(2)} ETH</span>
                </div>
              </AlertDescription>
            </Alert>
            
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                By completing this payment, you agree to the purchase of this NFT artwork.
                The transaction is final and non-refundable.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompletePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${remainingAmount.toFixed(2)} ETH`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
