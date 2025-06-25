"use client"

import React from "react"
import { useBiddingContext } from "@/contexts/bidding-context"
import { useFeatures } from "@/contexts/feature-context"
import { LevelUpNotification } from "@/components/level-up-notification"
import { ConfettiEffect } from "@/components/confetti-effect"

export function NotificationManager() {
  const { showLevelUp, setShowLevelUp, recentLevelUp } = useBiddingContext()
  const { features } = useFeatures()
  
  const handleClose = () => {
    setShowLevelUp(false)
  }
  
  // Don't show notifications if email notifications are enabled
  // (they will be handled by email instead)
  if (!showLevelUp || !recentLevelUp || features.enableEmailNotifications) {
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
