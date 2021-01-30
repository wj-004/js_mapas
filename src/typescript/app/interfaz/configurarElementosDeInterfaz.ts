import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires"
import { alClickearDistrito } from "../mapa/eventos/alClickearDistrito"
import { clickBotonRestaurar } from "./eventos/clickBotonRestaurar"
import { clickVisualizarCalles } from "./eventos/clickVisualizarCalles"
import { Selector } from "../../mapa/interfaz/Selector"

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
    
    const selector = new Selector(
        document.querySelector("#idSecciones"),
        {
            secciones: mapa.obtenerNombresDeZonas('secciones'),
            municipios: mapa.obtenerNombresDeZonas('municipios')
        },
        mapa
    )
    selector.alSeleccionar(alClickearDistrito)
}