import { Mapa } from "../../../mapa/Mapa";

/**
 * Listener para un evento.
 * 
 * Esta funcion deberia ser generica para este evento y otros de pintado de distritos.
 * Tarea para otro dia.
 */
export function pintarSeccionesIntendentes(mapa: Mapa) {
    return evento => {
        const secciones: { id: number, color: string }[] = evento.detail.data;
        const estilos = secciones
            .map(s => ({ id: Number(s.id), relleno: s.color }))
        mapa.setEstado({ estilos })
    }
}