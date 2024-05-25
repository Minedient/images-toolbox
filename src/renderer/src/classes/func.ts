/**
 * Calculate the max height of the div given its state
 * @param state Is the div expanded or not
 * @param div The div to calculate the max height of
 * @returns Its max height
 */
export function calcMaxHeight(state: boolean, div: HTMLElement) {
  return state ? div.scrollHeight : 0
}

/**
 * Show a notification on the screen
 * @param message The message to show
 */
export function showNotification(message: string) {
  const notification = document.createElement('div')
  notification.classList.add('notification')
  notification.textContent = message
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

/**
 * Get the css style for how the element should show in the grid consider only row
 * @param start The starting row
 * @param span The span of the row
 * @returns The css style
 */
export function gridRowSpan(start: number, span: number) {
  return `grid-row: ${start} / span ${span}`
}
/**
 * Get the css style for how the element should show in the grid consider only column
 * @param start The starting column
 * @param span The span of the column
 * @returns The css style
 */
export function gridColSpan(start: number, span: number) {
  return `grid-column: ${start} / span ${span}`
}
/**
 * Get the css style for how the element should show in the grid consider the area (both row and column)
 * @param startRow
 * @param startCol
 * @param rowSpan
 * @param colSpan
 * @returns
 */
export function gridAreaSpan(startRow: number, startCol: number, rowSpan: number, colSpan: number) {
  return `grid-area: ${startRow} / ${startCol} / span ${rowSpan} / span ${colSpan}`
}
