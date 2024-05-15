/**
 * Calculate the max height of the div given its state
 * @param state Is the div expanded or not
 * @param div The div to calculate the max height of
 * @returns Its max height
 */
export function calcMaxHeight(state: boolean, div: HTMLElement){
    return state ? div.scrollHeight : 0
}

/**
 * Show a notification on the screen
 * @param message The message to show
 */
export function showNotification(message: string){
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}