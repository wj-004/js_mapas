import { Mapa } from "../../../mapa/Mapa";

export function showMapa(mapa: Mapa) {
    return (evento: any) => {
        const id = evento.detail.data.id as number;
        mapa.enfocarDistritoPorId(id)
    }
}