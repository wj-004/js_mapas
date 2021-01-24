import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires"
import { clickBotonRestaurar } from "./eventos/clickBotonRestaurar"
import { clickSelect } from "./eventos/clickSelect"
import { clickVisualizarCalles } from "./eventos/clickVisualizarCalles"

export function configurarElementosDeInterfaz(mapa: MapaDeBuenosAires) {
    const showMapStreets: HTMLInputElement = document.querySelector("#showMapStreets")
    showMapStreets.onchange = clickVisualizarCalles(showMapStreets, mapa)

    const botonEnfocarDistritos: HTMLButtonElement = document.querySelector("#showDistritos")
    botonEnfocarDistritos.onclick = () => {
        mapa.municipios()
        showMapStreets.checked = false
    }
    
    const botonEnfocarSecciones: HTMLButtonElement = document.querySelector("#showSecciones")
    botonEnfocarSecciones.onclick = () => {
        mapa.secciones()
        showMapStreets.checked = false
    }
    
    const initialShow: HTMLButtonElement = document.querySelector("#initialShow")
    initialShow.onclick = clickBotonRestaurar(initialShow, mapa, showMapStreets)
    
    const select: HTMLSelectElement = document.querySelector("#idSecciones")
    select.onchange = clickSelect(select, mapa)
}