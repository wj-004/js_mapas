export function alClickearDistrito(id: number) {
    // @ts-ignore
    if (typeof livewire !== 'undefined') {
        // @ts-ignore
        livewire.emit('verDetalle', { id })
    }
}