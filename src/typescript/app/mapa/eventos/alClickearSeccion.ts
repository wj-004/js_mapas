import { livewireEmit } from "../../../util/livewireEmit"

export function alClickearSeccion(id: number) {
    livewireEmit('clickEnSeccion', id)
    dispatchEvent(new CustomEvent('clickEnSeccion', { detail: id }))
}