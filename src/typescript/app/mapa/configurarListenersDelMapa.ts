import { Mapa } from "../../mapa/Mapa";
import { alClickearDistrito } from "./eventos/alClickearDistrito";
import { alEnfocar } from "./eventos/alEnfocar";

export function configurarListenersDelMapa(mapa: Mapa) {
    mapa.alClickearCualquierDistrito(alClickearDistrito)

    mapa.alEnfocar(alEnfocar);
}