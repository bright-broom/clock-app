import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTimerAlarm } from './useTimerAlarm'

const audio = vi.hoisted(() => ({
  close: vi.fn(() => Promise.resolve()),
  construct: vi.fn(),
  gainConnect: vi.fn(),
  oscillatorConnect: vi.fn(),
  resume: vi.fn(() => Promise.resolve()),
  start: vi.fn(),
  stop: vi.fn(),
}))

class FakeAudioContext {
  currentTime = 1
  destination = {}
  state: AudioContextState = 'running'

  constructor() {
    audio.construct()
  }

  close = audio.close
  resume = audio.resume

  createOscillator() {
    return {
      connect: audio.oscillatorConnect,
      frequency: { setValueAtTime: vi.fn() },
      start: audio.start,
      stop: audio.stop,
      type: 'sine',
    } as unknown as OscillatorNode
  }

  createGain() {
    return {
      connect: audio.gainConnect,
      gain: {
        exponentialRampToValueAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
      },
    } as unknown as GainNode
  }
}

describe('useTimerAlarm', () => {
  const originalAudioContext = Object.getOwnPropertyDescriptor(
    window,
    'AudioContext'
  )

  beforeEach(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext as unknown as typeof AudioContext,
    })
    Object.values(audio).forEach((mock) => mock.mockClear())
  })

  afterEach(() => {
    if (originalAudioContext) {
      Object.defineProperty(window, 'AudioContext', originalAudioContext)
    } else {
      Reflect.deleteProperty(window, 'AudioContext')
    }
  })

  it('prepares on user interaction and synthesizes three tones', () => {
    const { result, unmount } = renderHook(() => useTimerAlarm(true))

    act(() => result.current.prepare())
    act(() => result.current.play())

    expect(audio.construct).toHaveBeenCalledTimes(1)
    expect(audio.start).toHaveBeenCalledTimes(3)
    expect(audio.stop).toHaveBeenCalledTimes(3)

    unmount()
    expect(audio.close).toHaveBeenCalledTimes(1)
  })

  it('does not create an audio context while muted', () => {
    const { result } = renderHook(() => useTimerAlarm(false))

    act(() => result.current.prepare())
    act(() => result.current.play())

    expect(audio.construct).not.toHaveBeenCalled()
  })
})
