import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __resetTimerAlarmStore,
  playTimerAlarm,
  useTimerAlarm,
} from './useTimerAlarm'

const audio = vi.hoisted(() => ({
  close: vi.fn(() => Promise.resolve()),
  construct: vi.fn(),
  gainConnect: vi.fn(),
  initialState: 'running' as AudioContextState,
  oscillatorConnect: vi.fn(),
  rejectResume: false,
  resume: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}))

class FakeAudioContext {
  currentTime = 1
  destination = {}
  state = audio.initialState

  constructor() {
    audio.construct()
  }

  close = audio.close

  resume = audio.resume.mockImplementation(async () => {
    if (audio.rejectResume) {
      throw new Error('autoplay blocked')
    }
    this.state = 'running'
  })

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
    __resetTimerAlarmStore()
    window.localStorage.clear()
    audio.initialState = 'running'
    audio.rejectResume = false
    Object.values(audio).forEach((value) => {
      if (typeof value === 'function' && 'mockClear' in value) {
        value.mockClear()
      }
    })
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext as unknown as typeof AudioContext,
    })
  })

  afterEach(() => {
    __resetTimerAlarmStore()
    window.localStorage.clear()
    if (originalAudioContext) {
      Object.defineProperty(window, 'AudioContext', originalAudioContext)
    } else {
      Reflect.deleteProperty(window, 'AudioContext')
    }
  })

  it('prepares once and synthesizes three tones', async () => {
    const { result, unmount } = renderHook(() => useTimerAlarm())

    await act(async () => {
      expect(await result.current.prepare()).toBe(true)
      expect(await playTimerAlarm()).toBe(true)
    })

    expect(result.current.availability).toBe('ready')
    expect(audio.construct).toHaveBeenCalledTimes(1)
    expect(audio.start).toHaveBeenCalledTimes(3)
    expect(audio.stop).toHaveBeenCalledTimes(3)

    unmount()
    expect(audio.close).not.toHaveBeenCalled()
  })

  it('persists the sound preference and restores it after remount', () => {
    const first = renderHook(() => useTimerAlarm())

    act(() => first.result.current.setEnabled(false))
    expect(first.result.current.enabled).toBe(false)
    expect(window.localStorage.getItem('clock-app:timer-sound:v1')).toBe('off')

    first.unmount()
    __resetTimerAlarmStore()
    const second = renderHook(() => useTimerAlarm())
    expect(second.result.current.enabled).toBe(false)
  })

  it('synchronizes a valid preference from another tab', () => {
    const { result } = renderHook(() => useTimerAlarm())

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'clock-app:timer-sound:v1',
          newValue: 'off',
        })
      )
    })

    expect(result.current.enabled).toBe(false)
  })

  it('surfaces a blocked AudioContext instead of swallowing the failure', async () => {
    audio.initialState = 'suspended'
    audio.rejectResume = true
    const { result } = renderHook(() => useTimerAlarm())

    await act(async () => {
      expect(await result.current.prepare()).toBe(false)
    })

    expect(result.current.availability).toBe('blocked')
    expect(audio.resume).toHaveBeenCalledTimes(1)
  })

  it('reports unsupported browsers without creating a context', async () => {
    Reflect.deleteProperty(window, 'AudioContext')
    const { result } = renderHook(() => useTimerAlarm())

    await act(async () => {
      expect(await result.current.prepare()).toBe(false)
    })

    expect(result.current.availability).toBe('unsupported')
    expect(audio.construct).not.toHaveBeenCalled()
  })
})
