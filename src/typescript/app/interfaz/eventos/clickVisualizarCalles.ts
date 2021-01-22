import { Mapa } from "../../../mapa/Mapa"

export function clickVisualizarCalles(checkbox: HTMLInputElement, mapa: Mapa) {
    return () => {
        if (checkbox.checked) {
            // mapa.mostrarCallesEnZonaEnfocada()
            // capas = [ opensm, municipios ]
            // visibilidad = [ { id } ]
        } else {
            mapa.ocultarCalles()
        }
    }
}