import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";

export function enfocarZonaGuardada(mapa: MapaDeBuenosAires) {
    const estadoMapaMaybe = localStorage.getItem('EstadoMapa')
    if (!!estadoMapaMaybe) {
        const estadoMapa = JSON.parse(estadoMapaMaybe)
        mapa.restaurarEstado(estadoMapa, false);
    }
}