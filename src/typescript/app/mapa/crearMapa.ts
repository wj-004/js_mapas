import VectorLayer from "ol/layer/Vector";
import { Mapa } from "../../mapa/Mapa";
import { getLayers } from "../../util/getLayer";

export function crearMapa(capas: VectorLayer[]): Mapa {
    return new Mapa(
        document.querySelector("#map"),
        document.querySelector("#idSecciones"),
        capas,
    );
}