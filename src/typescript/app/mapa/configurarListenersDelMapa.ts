import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";
import { alClickearDistrito } from "./eventos/alClickearDistrito";
import { alEnfocar } from "./eventos/alEnfocar";

export function configurarListenersDelMapa(mapa: MapaDeBuenosAires) {
    mapa.alClickearMunicipio(alClickearDistrito)

    mapa.alEnfocar(alEnfocar);
}