import { Mapa } from "../../mapa/Mapa"
import { clickBotonRestaurar } from "./eventos/clickBotonRestaurar"
import { clickSelect } from "./eventos/clickSelect"
import { clickVisualizarCalles } from "./eventos/clickVisualizarCalles"

export function configurarElementosDeInterfaz(mapa: Mapa) {
    const botonEnfocarDistritos: HTMLButtonElement = document.querySelector("#showDistritos")
    botonEnfocarDistritos.onclick = () => {
        mapa.enfocarDistritos()
    }
    
    const botonEnfocarSecciones: HTMLButtonElement = document.querySelector("#showSecciones")
    botonEnfocarSecciones.onclick = () => {
        mapa.enfocarSecciones()
    }
    
    const showMapStreets: HTMLInputElement = document.querySelector("#showMapStreets")
    showMapStreets.onchange = clickVisualizarCalles(showMapStreets, mapa)
    
    const initialShow: HTMLButtonElement = document.querySelector("#initialShow")
    initialShow.onclick = clickBotonRestaurar(initialShow, mapa)
    
    const select: HTMLSelectElement = document.querySelector("#idSecciones")
    select.onchange = clickSelect(select, mapa)
}