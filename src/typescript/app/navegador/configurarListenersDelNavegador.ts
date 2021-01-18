import { Mapa } from "../../mapa/Mapa";
import { limpiarStorage } from "./eventos/limpiarStorage";
import { pintarMapa } from "./eventos/pintarDistritos";
import { showMapa } from "./eventos/showMap";
import { mostrarPines } from "./eventos/mostrarPines";
import { pintarDistritosIntendents } from "../mapa/eventos/pintarDistritosIntendents";
import { pintarSeccionesIntendentes } from "./eventos/pintarSeccionesIntendentes";
import { pintarDepartamentoJudicial } from "./eventos/pintarDepartamentoJudicial";
import { pintarDepartamentosJudiciales } from "./eventos/pintarDepartamentosJudiciales";
import { bordearDistritos } from "./eventos/bordearDistritos";

export function configurarListenersDelNavegador(mapa: Mapa) {
    window.addEventListener('pintarDistritos', pintarMapa);

    window.addEventListener('pintarDistritosIntendentes', pintarDistritosIntendents(mapa));

    window.addEventListener('pintarSeccionesIntendentes', pintarSeccionesIntendentes(mapa));

    window.addEventListener('pintarDepartamentoJudicial', pintarDepartamentoJudicial(mapa));

    window.addEventListener('pintarDepartamentosJudiciales', pintarDepartamentosJudiciales(mapa));

    window.addEventListener('bordearDistritos', bordearDistritos(mapa));

    window.addEventListener('show-map', showMapa(mapa))

    window.addEventListener('limpiarStorage', limpiarStorage)

    window.addEventListener('mostrarPines', mostrarPines(mapa))
}