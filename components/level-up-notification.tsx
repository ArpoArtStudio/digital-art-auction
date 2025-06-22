"use client"

import React, { useState, useEffect } from "react"
import { Award, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBiddingContext, BiddingLevel } from "@/contexts/bidding-context"

interface LevelUpNotificationProps {
  level: BiddingLevel
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function LevelUpNotification({
  level,
  onClose,
  autoClose = true,
  autoCloseDelay = 10000 // 10 seconds default
}: LevelUpNotificationProps) {
  const { getLevelName, getLevelColor, getLevelBadge } = useBiddingContext()
  const [visible, setVisible] = useState(true)

  // State to control fade out animation
  const [isFading, setIsFading] = useState(false)

  // Auto close after delay if enabled
  useEffect(() => {
    if (autoClose && visible && !isFading) {
      const timer = setTimeout(() => {
        setIsFading(true)
        setTimeout(() => {
          setVisible(false)
          setTimeout(onClose, 100)
        }, 300) // Time to match fadeOut animation duration
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay, visible, onClose, isFading])

  // Handle close button click
  const handleClose = () => {
    setIsFading(true)
    setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 100)
    }, 300) // Time to match fadeOut animation duration
  }

  // Get background gradient based on level
  const getBgGradient = (level: BiddingLevel) => {
    switch (level) {
      case BiddingLevel.Newcomer:
        return "from-blue-500/20 to-blue-400/10"
      case BiddingLevel.Bidder:
        return "from-green-500/20 to-green-400/10"
      case BiddingLevel.Active:
        return "from-yellow-500/20 to-yellow-400/10"
      case BiddingLevel.Veteran:
        return "from-orange-500/20 to-orange-400/10"
      case BiddingLevel.Expert:
        return "from-purple-500/20 to-purple-400/10"
      case BiddingLevel.Master:
        return "from-red-500/20 to-red-400/10"
      default:
        return "from-blue-500/20 to-blue-400/10"
    }
  }

  return (
    <>
      {visible && (
        <div
          className={`fixed bottom-[9.5rem] right-6 z-50 w-80 p-4 rounded-lg border bg-gradient-to-br ${getBgGradient(level)} backdrop-blur-sm shadow-lg ${isFading ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-3 rounded-full mr-3 ${getLevelColor(level).replace('text-', 'bg-').replace('-400', '-400/30')}`}>
                <Award className={`h-6 w-6 ${getLevelColor(level)}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Level Up!</h3>
                <p className="text-sm opacity-80">You've reached a new level</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full p-1 opacity-70 hover:opacity-100"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <span className={`text-sm font-bold ${getLevelColor(level)}`}>
                  {getLevelName(level)}
                </span>
                <p className="text-xs opacity-70">You're making progress!</p>
              </div>
              <div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(level).replace('text-', 'bg-').replace('-400', '-400/30')} ${getLevelColor(level)}`}>
                  {getLevelBadge(level)}
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs opacity-80">
              <p>Keep bidding to unlock more features and benefits!</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
