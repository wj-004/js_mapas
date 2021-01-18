import { Mapa } from "../../../mapa/Mapa";

export function bordearDistritos(mapa: Mapa) {
    return evento => {
        const distritos = evento.detail.data.distritos;
        const borde = evento.detail.data.color;

        for (let distrito of distritos) {
            mapa.pintarDistritoPorID(distrito.id, undefined, borde, true)
        }
    }
}