import { Mapa } from "../../../mapa/Mapa";

export function pintarDepartamentoJudicial(mapa: Mapa) {
    return evento => {
        mapa.restablecerEstiloDeDistritos();
        for (let distrito of evento.data) {
            mapa.pintarDistritoPorID(distrito.id, distrito.color);
        }
    }
}