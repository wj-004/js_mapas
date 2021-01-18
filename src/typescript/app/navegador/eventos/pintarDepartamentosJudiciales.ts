import { Mapa } from "../../../mapa/Mapa";

type Evento = {
    detail: {
        data: [
            { id: number, color: string}[]
        ]
    }
}

export function pintarDepartamentosJudiciales(mapa: Mapa) {
    return evento => {
        console.log(evento.detail)
        mapa.restablecerEstiloDeDistritos();
        const departamentos = evento.detail.data
        for (let departamento of departamentos) {
            for (let distrito of departamento) {
                mapa.pintarDistritoPorID(distrito.id, distrito.color);
            }
        }
    }
}