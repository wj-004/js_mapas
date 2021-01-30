export function alClickearDistrito(id: number) {
    // @ts-ignore
    if (typeof livewire !== 'undefined') {
        // @ts-ignore
        livewire.emit('clickEnMunicipio', id)
    }

    dispatchEvent(new CustomEvent('clickEnMunicipio', { detail: id }))
}