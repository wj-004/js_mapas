import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";
import { alClickearDistrito } from "./eventos/alClickearDistrito";
import { alClickearSeccion } from "./eventos/alClickearSeccion";
import { alEnfocar } from "./eventos/alEnfocar";

export function configurarListenersDelMapa(mapa: MapaDeBuenosAires) {
    mapa.alClickearMunicipio(alClickearDistrito)

    mapa.alClickearSeccion(alClickearSeccion)

    mapa.alEnfocar(alEnfocar);
}