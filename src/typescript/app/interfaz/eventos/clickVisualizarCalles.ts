import { Mapa } from "../../../mapa/Mapa"
import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires"

export function clickVisualizarCalles(checkbox: HTMLInputElement, mapa: MapaDeBuenosAires) {
    return () => {
        mapa.alternarVisibilidadDeCalles(checkbox.checked)
    }
}