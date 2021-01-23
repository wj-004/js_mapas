import { Mapa } from "../../../mapa/Mapa";

export function clickSelect(select: HTMLSelectElement, mapa: Mapa) {
    return () => {
        const id = Number(select.value)
        if (id === -1) {
            mapa.setEstado({ enfoque: [] })
        } else {
            if (mapa.estado.enfoque.length > 0) {
                // mapa.enfocarDistritoPorId(id)
            } else {
                if (mapa.nombreCapaActual === 'secciones') {
                    // mapa.enfocarSeccionPorId(id)
                } else if (mapa.nombreCapaActual === 'municipios') {
                    // mapa.enfocarDistritoPorId(id)
                }
            }
        }
    }
}