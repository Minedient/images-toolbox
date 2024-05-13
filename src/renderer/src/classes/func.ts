/**
 * Calculate the max height of the div given its state
 * @param state Is the div expanded or not
 * @param div The div to calculate the max height of
 * @returns Its max height
 */
export function calcMaxHeight(state: boolean, div: HTMLElement){
    return state ? div.scrollHeight : 0
}