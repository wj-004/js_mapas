import { Mapa } from "../../../mapa/Mapa";

/**
 * Listener para un evento.
 * 
 * Esta funcion deberia ser generica para este evento y otros de pintado de distritos.
 * Tarea para otro dia.
 */
export function pintarSeccionesIntendentes(mapa: Mapa) {
    return evento => {
        const secciones = evento.detail.data;
        for (let seccion of secciones) {
            mapa.pintarSeccionPorID(seccion.id, seccion.color);
        }
    }
}