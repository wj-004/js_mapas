import { Mapa } from "../../../mapa/Mapa";

export function bordearDistritos(mapa: Mapa) {
    return evento => {
        const ids = evento.detail.distritos;
        const borde = evento.detail.color;

        for (let distrito of ids) {
            mapa.pintarDistritoPorID(Number(distrito), undefined, borde, true)
        }
    }
}