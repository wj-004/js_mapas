import { Mapa } from "../../mapa/Mapa"

export function enfocarZonaGuardada(mapa: Mapa) {
    const estadoMapaMaybe = localStorage.getItem('EstadoMapa')
    if (!!estadoMapaMaybe) {
        const estadoMapa = JSON.parse(estadoMapaMaybe)
        mapa.setEstado(estadoMapa, false);
    }
}