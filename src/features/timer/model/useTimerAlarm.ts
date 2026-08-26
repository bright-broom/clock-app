'use client'

import { useCallback, useEffect, useRef } from 'react'

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (
    window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext
  )
}

export function useTimerAlarm(enabled: boolean): {
  play: () => void
  prepare: () => void
} {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext | null => {
    if (contextRef.current?.state === 'closed') {
      contextRef.current = null
    }

    if (!contextRef.current) {
      const AudioContextConstructor = getAudioContextConstructor()
      contextRef.current = AudioContextConstructor
        ? new AudioContextConstructor()
        : null
    }

    return contextRef.current
  }, [])

  const prepare = useCallback(() => {
    if (!enabled) {
      return
    }

    const context = getContext()
    if (context?.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }
  }, [enabled, getContext])

  const play = useCallback(() => {
    if (!enabled) {
      return
    }

    const context = getContext()
    if (!context) {
      return
    }

    const playTones = () => {
      const startAt = context.currentTime

      for (const [index, frequency] of [880, 1046, 1318].entries()) {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const toneStart = startAt + index * 0.18

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(frequency, toneStart)
        gain.gain.setValueAtTime(0.0001, toneStart)
        gain.gain.exponentialRampToValueAtTime(0.12, toneStart + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.14)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(toneStart)
        oscillator.stop(toneStart + 0.15)
      }
    }

    if (context.state === 'suspended') {
      void context
        .resume()
        .then(playTones)
        .catch(() => undefined)
    } else {
      playTones()
    }
  }, [enabled, getContext])

  useEffect(
    () => () => {
      const context = contextRef.current
      contextRef.current = null

      if (context && context.state !== 'closed') {
        void context.close().catch(() => undefined)
      }
    },
    []
  )

  return { play, prepare }
}
