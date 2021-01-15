import { Mapa } from "../../mapa/Mapa";
import { limpiarStorage } from "./eventos/limpiarStorage";
import { pintarMapa } from "./eventos/pintarDistritos";
import { showMapa } from "./eventos/showMap";
import { mostrarPines } from "./eventos/mostrarPines";

export function configurarListenersDelNavegador(mapa: Mapa) {
    window.addEventListener('pintarDistritos', pintarMapa);

    window.addEventListener('show-map', showMapa(mapa))

    window.addEventListener('limpiarStorage', limpiarStorage)

    window.addEventListener('mostrarPines', mostrarPines(mapa))
}