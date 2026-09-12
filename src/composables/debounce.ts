export function debounce<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
    let timer: number | null = null
    const debounced = function (...args: T) {
        if (timer !== null) clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
            timer = null
        }, delay);
    }
    debounced.cancel = function() {
        if (timer !== null) {
            clearTimeout(timer)
            timer = null
        }
    }
    return debounced
}