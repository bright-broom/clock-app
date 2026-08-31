const INTERACTIVE_TARGET_SELECTOR =
  'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="spinbutton"], [role="textbox"], [role="combobox"], [role="menuitem"], [role="tab"], [role="option"]'

/** Prevents global shortcuts from overriding focused interactive controls. */
export function isInteractiveEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  if (target instanceof HTMLElement && target.isContentEditable) {
    return true
  }

  const editableRoot = target.closest('[contenteditable]')
  if (
    editableRoot &&
    editableRoot.getAttribute('contenteditable')?.toLowerCase() !== 'false'
  ) {
    return true
  }

  return target.closest(INTERACTIVE_TARGET_SELECTOR) !== null
}
