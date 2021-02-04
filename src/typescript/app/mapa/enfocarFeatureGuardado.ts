import { Estado } from "../../mapa/Mapa";
import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";
import { livewireEmit } from "../../util/livewireEmit";

/**
 * Aplica al mapa el estado guardado en localStorage, si lo hay.
 * 
 * Retorna true si habia estado guardado, o false si no lo habia.
 * @param mapa 
 */
export function aplicarEstadoGuardado(mapa: MapaDeBuenosAires) {
    const estadoMapaMaybe = localStorage.getItem('EstadoMapa')
    if (!!estadoMapaMaybe) {
        const estadoMapa: Estado = JSON.parse(estadoMapaMaybe)
        mapa.restaurarEstado(estadoMapa, false);
        const capaActual = estadoMapa.capas[estadoMapa.capas.length - 1];
        if (capaActual === 'municipios' && estadoMapa.enfoque.length > 0) {
            const id = estadoMapa.enfoque[0];
            livewireEmit('verDetalleDeMunicipioGuardado', id)
        }
    }

    return !!estadoMapaMaybe;
}