import { Mapa } from "../../../mapa/Mapa";

export function showMapa(mapa: Mapa) {
    return (evento: any) => {
        const id = evento.detail.id as number;
        mapa.setEstado({ enfoque: [ id ] })
    }
}