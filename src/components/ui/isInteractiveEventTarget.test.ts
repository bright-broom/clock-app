import { describe, expect, it } from 'vitest'

import { isInteractiveEventTarget } from './isInteractiveEventTarget'

describe('isInteractiveEventTarget', () => {
  it.each(['button', 'input', 'select', 'textarea', 'summary'])(
    'recognizes native %s controls',
    (tagName) => {
      expect(isInteractiveEventTarget(document.createElement(tagName))).toBe(
        true
      )
    }
  )

  it('recognizes linked, editable, and ARIA controls through descendants', () => {
    const link = document.createElement('a')
    link.href = '/ja'
    const linkChild = document.createElement('span')
    link.append(linkChild)

    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')

    const customButton = document.createElement('div')
    customButton.setAttribute('role', 'button')

    expect(isInteractiveEventTarget(linkChild)).toBe(true)
    expect(isInteractiveEventTarget(editable)).toBe(true)
    expect(isInteractiveEventTarget(customButton)).toBe(true)
  })

  it.each(['', 'true', 'plaintext-only'])(
    'recognizes contenteditable="%s" and its descendants',
    (value) => {
      const editable = document.createElement('div')
      editable.setAttribute('contenteditable', value)
      const child = document.createElement('span')
      editable.append(child)

      expect(isInteractiveEventTarget(editable)).toBe(true)
      expect(isInteractiveEventTarget(child)).toBe(true)
    }
  )

  it('respects an explicit non-editable island', () => {
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    const nonEditable = document.createElement('span')
    nonEditable.setAttribute('contenteditable', 'false')
    editable.append(nonEditable)

    expect(isInteractiveEventTarget(nonEditable)).toBe(false)
  })

  it('does not classify passive or missing targets as interactive', () => {
    expect(isInteractiveEventTarget(document.createElement('div'))).toBe(false)
    expect(isInteractiveEventTarget(document.createElement('a'))).toBe(false)
    expect(isInteractiveEventTarget(null)).toBe(false)
  })
})
