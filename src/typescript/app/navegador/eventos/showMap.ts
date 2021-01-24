import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires";

export function showMapa(mapa: MapaDeBuenosAires) {
    return (evento: any) => {
        const id = evento.detail.id as number;
        mapa.mostrarSoloZona([id])
    }
}