"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs text-muted-foreground">Minutes</div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs text-muted-foreground">Seconds</div>
      </div>
    </div>
  )
}
