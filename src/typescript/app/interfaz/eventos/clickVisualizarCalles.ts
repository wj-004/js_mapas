import { Mapa } from "../../../mapa/Mapa"

export function clickVisualizarCalles(checkbox: HTMLInputElement, mapa: Mapa) {
    return () => {
        if (checkbox.checked) {
            mapa.mostrarCalles()
        } else {
            mapa.ocultarCalles()
        }
    }
}