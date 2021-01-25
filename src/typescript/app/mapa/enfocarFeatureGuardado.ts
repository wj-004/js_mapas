import { Estado } from "../../mapa/Mapa";
import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";
import { livewireEmit } from "../../util/livewireEmit";

export function enfocarZonaGuardada(mapa: MapaDeBuenosAires) {
    const estadoMapaMaybe = localStorage.getItem('EstadoMapa')
    if (!!estadoMapaMaybe) {
        const estadoMapa: Estado = JSON.parse(estadoMapaMaybe)
        mapa.restaurarEstado(estadoMapa, false);
        if (estadoMapa.enfoque.length > 0) {
            const id = estadoMapa.enfoque[0];
            livewireEmit('verDetalleDeMunicipioGuardado', id)
        }
    }
}