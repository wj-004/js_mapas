import { Mapa } from "../../mapa/Mapa";
import { limpiarStorage } from "./eventos/limpiarStorage";
import { pintarMapa } from "./eventos/pintarDistritos";
import { showMapa } from "./eventos/showMap";
import { mostrarPines } from "./eventos/mostrarPines";
import { pintarDistritosIntendents } from "../mapa/eventos/pintarDistritosIntendents";
import { pintarSeccionesIntendentes } from "./eventos/pintarSeccionesIntendentes";

export function configurarListenersDelNavegador(mapa: Mapa) {
    window.addEventListener('pintarDistritos', pintarMapa);

    window.addEventListener('pintarDistritosIntendentes', pintarDistritosIntendents(mapa));

    window.addEventListener('pintarSeccionesIntendentes', pintarSeccionesIntendentes(mapa));

    let data = { 
        data: [
            { distrito_id: 51, color: "#283084" },
            { distrito_id: 52, color: "#283084" },
            { distrito_id: 53, color: "#283084" },
            { distrito_id: 54, color: "#009FE3" },
            { distrito_id: 55, color: "#009FE3" },
            { distrito_id: 56, color: "#009FE3" },
            { distrito_id: 57, color: "#009FE3" },
            { distrito_id: 58, color: "#009FE3" },
            { distrito_id: 59, color: "#009FE3" },
            { distrito_id: 60, color: "#009FE3" },
            { distrito_id: 61, color: "#009FE3" },
            { distrito_id: 62, color: "#009FE3" },
            { distrito_id: 63, color: "#009FE3" },
            { distrito_id: 64, color: "#009FE3" },
            { distrito_id: 65, color: "#F3F1A6" },
            { distrito_id: 66, color: "#F3F1A6" },
            { distrito_id: 67, color: "#F3F1A6" },
            { distrito_id: 68, color: "#F3F1A6" },
            { distrito_id: 69, color: "#F3F1A6" },
            
            { distrito_id: 55, color: "#009FE3" },
            { distrito_id: 56, color: "#009FE3" },
            { distrito_id: 57, color: "#009FE3" },
            { distrito_id: 58, color: "#009FE3" },
            { distrito_id: 59, color: "#009FE3" },
            { distrito_id: 60, color: "#009FE3" },
            { distrito_id: 61, color: "#009FE3" },
            { distrito_id: 62, color: "#009FE3" },
            { distrito_id: 63, color: "#009FE3" },
            { distrito_id: 64, color: "#009FE3" },
            { distrito_id: 65, color: "#F3F1A6" },
            { distrito_id: 66, color: "#F3F1A6" },
            { distrito_id: 67, color: "#F3F1A6" },
            { distrito_id: 68, color: "#F3F1A6" },
            { distrito_id: 69, color: "#F3F1A6" },
        ]
    }

    dispatchEvent(new CustomEvent('pintarDistritosIntendentes', { detail: data }))

    window.addEventListener('show-map', showMapa(mapa))

    window.addEventListener('limpiarStorage', limpiarStorage)

    window.addEventListener('mostrarPines', mostrarPines(mapa))
}