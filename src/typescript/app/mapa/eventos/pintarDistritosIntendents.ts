import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires";

/**
 * Listener para un evento.
 * 
 * Esta funcion deberia ser generica para este evento y otros de pintado de distritos.
 * Tarea para otro dia.
 */
export function pintarDistritosIntendents(mapa: MapaDeBuenosAires) {
    return evento => {
        const estilos: { id: number, relleno: string, borde?: string, bordeGrueso?: boolean }[] = evento.detail.data;
        mapa.pintarMunicipios(estilos)
    }
}