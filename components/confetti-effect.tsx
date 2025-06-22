"use client"

import React, { useState, useEffect } from 'react'
import { useBiddingContext, BiddingLevel } from '@/contexts/bidding-context'

interface ConfettiParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  velocity: {
    x: number
    y: number
  }
  rotation: number
  rotationSpeed: number
}

interface ConfettiEffectProps {
  level: BiddingLevel
  duration?: number
  particleCount?: number
  onComplete?: () => void
}

export function ConfettiEffect({
  level,
  duration = 5000,
  particleCount = 100,
  onComplete
}: ConfettiEffectProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])
  const [active, setActive] = useState(true)
  const { getLevelColor } = useBiddingContext()
  
  // Generate color palette based on level
  const generateColorPalette = (level: BiddingLevel): string[] => {
    const baseColor = getLevelColor(level).replace('text-', '').replace('-400', '')
    
    // Create a palette with base color, gold, silver, and white
    return [
      `${baseColor}-400`,
      `${baseColor}-300`, 
      'yellow-400',  // Gold
      'gray-200',    // Silver
      'white'
    ]
  }

  // Initialize confetti particles
  useEffect(() => {
    const colors = generateColorPalette(level)
    const newParticles: ConfettiParticle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100, // Start above the screen
        size: 5 + Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: -2 + Math.random() * 4,
          y: 5 + Math.random() * 7
        },
        rotation: Math.random() * 360,
        rotationSpeed: -4 + Math.random() * 8
      })
    }
    
    setParticles(newParticles)
    
    // Set timeout to stop animation
    const timer = setTimeout(() => {
      setActive(false)
      if (onComplete) {
        setTimeout(onComplete, 1000) // Give time for fadeout
      }
    }, duration)
    
    return () => clearTimeout(timer)
  }, [level, particleCount, duration, onComplete])
  
  // Animation frame
  useEffect(() => {
    if (!active) return
    
    let animationFrame: number
    
    const updateParticles = () => {
      setParticles(prevParticles => {
        return prevParticles.map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          rotation: (p.rotation + p.rotationSpeed) % 360,
          velocity: {
            x: p.velocity.x * 0.99, // Slight horizontal slowdown
            y: p.velocity.y + 0.1  // Gravity
          }
        }))
      })
      
      animationFrame = requestAnimationFrame(updateParticles)
    }
    
    animationFrame = requestAnimationFrame(updateParticles)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [active])
  
  if (!active && particles.length === 0) return null
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-50 ${
        active ? 'opacity-100' : 'opacity-0 transition-opacity duration-1000'
      }`}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute rounded-sm bg-${particle.color}`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size / 2}px`,
            transform: `rotate(${particle.rotation}deg)`
          }}
        />
      ))}
    </div>
  )
}
