import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const alarm = vi.hoisted(() => ({
  play: vi.fn<() => Promise<boolean>>(),
}))

vi.mock('./useTimerAlarm', () => ({
  playTimerAlarm: alarm.play,
}))

import {
  __resetTimerAlarmCoordinator,
  requestTimerCompletionAlarm,
} from './timerAlarmCoordinator'

describe('timerAlarmCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
    __resetTimerAlarmCoordinator()
    alarm.play.mockReset()
    alarm.play.mockResolvedValue(true)
  })

  afterEach(() => {
    __resetTimerAlarmCoordinator()
    window.localStorage.clear()
    vi.useRealTimers()
  })

  async function settle<T>(promise: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(32)
    return promise
  }

  it('plays a completion only once for the same persisted key', async () => {
    await expect(
      settle(requestTimerCompletionAlarm('v1:1700000000000'))
    ).resolves.toBe('played')
    await expect(requestTimerCompletionAlarm('v1:1700000000000')).resolves.toBe(
      'claimed'
    )

    expect(alarm.play).toHaveBeenCalledTimes(1)
  })

  it('allows a later distinct countdown to claim playback', async () => {
    await settle(requestTimerCompletionAlarm('v1:first'))
    await expect(
      settle(requestTimerCompletionAlarm('v1:second'))
    ).resolves.toBe('played')

    expect(alarm.play).toHaveBeenCalledTimes(2)
  })

  it('releases a provisional claim when playback is unavailable', async () => {
    alarm.play.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    await expect(settle(requestTimerCompletionAlarm('v1:retry'))).resolves.toBe(
      'unavailable'
    )
    await expect(settle(requestTimerCompletionAlarm('v1:retry'))).resolves.toBe(
      'played'
    )

    expect(alarm.play).toHaveBeenCalledTimes(2)
  })

  it('ignores malformed claim storage', async () => {
    window.localStorage.setItem('clock-app:timer-alarm-claim:v1', '{bad json')

    await expect(settle(requestTimerCompletionAlarm('v1:valid'))).resolves.toBe(
      'played'
    )
  })
})
