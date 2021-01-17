export function livewireEmit(nombre: string, datos?: any) {
    // @ts-ignore
    if (livewire) {
        if (datos) {
            // @ts-ignore
            livewire.emit(nombre, datos)
        } else {
            // @ts-ignore
            livewire.emit(nombre)
        }
    }
}