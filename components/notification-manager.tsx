"use client"

import React from "react"
import { useBiddingContext } from "@/contexts/bidding-context"
import { LevelUpNotification } from "@/components/level-up-notification"
import { ConfettiEffect } from "@/components/confetti-effect"

export function NotificationManager() {
  const { showLevelUp, setShowLevelUp, recentLevelUp } = useBiddingContext()
  
  const handleClose = () => {
    setShowLevelUp(false)
  }
  
  if (!showLevelUp || !recentLevelUp) {
    return null
  }
  
  return (
    <>
      <LevelUpNotification 
        level={recentLevelUp}
        onClose={handleClose}
        autoClose={true}
        autoCloseDelay={5000}
      />
      <ConfettiEffect 
        level={recentLevelUp}
        duration={5000}
        particleCount={150}
      />
    </>
  )
}
