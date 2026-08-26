const UTC_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export function toUtcInputValue(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 16)
}

export function parseUtcInput(value: string): Date | null {
  if (!UTC_INPUT_PATTERN.test(value)) {
    return null
  }

  const parsed = new Date(`${value}:00.000Z`)

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 16) !== value
  ) {
    return null
  }

  return parsed
}
