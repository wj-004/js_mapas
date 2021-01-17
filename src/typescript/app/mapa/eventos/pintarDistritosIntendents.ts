import { Mapa } from "../../../mapa/Mapa";

/**
 * Listener para un evento.
 * 
 * Esta funcion deberia ser generica para este evento y otros de pintado de distritos.
 * Tarea para otro dia.
 */
export function pintarDistritosIntendents(mapa: Mapa) {
    return evento => {
        for (let intendente of evento.detail.data) {
            mapa.pintarDistritoPorID(intendente.partido.id, intendente.partido.color, intendente.partido.color);
        }
    }
}