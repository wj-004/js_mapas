import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires";

export function clickSelect(select: HTMLSelectElement, mapa: MapaDeBuenosAires) {
    return () => {
        const id = Number(select.value)
        if (id === -1) {
            mapa.enfocarProvincia()
        } else {
            if (mapa.hayAlgunaZonaEnfocada()) {
                mapa.mostrarSoloZona([id])
            } else {
                if (mapa.estaEnSecciones()) {
                    mapa.enfocarMunicipiosDeSeccion(id)
                } else {
                    mapa.mostrarSoloZona([id])
                }
            }
        }
    }
}