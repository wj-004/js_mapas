import { Mapa } from "./Mapa";
import { getLayer } from './util/getLayer'

const mapa = new Mapa(document.querySelector("#map"))

mapa.iniciarlizar()

const showDistritos: HTMLButtonElement = document.querySelector("#showDistritos")
showDistritos.onclick = () => {
    mapa.ocultarSecciones()
    mapa.mostrarDistritos()
}

const showSecciones: HTMLButtonElement = document.querySelector("#showSecciones")
showSecciones.onclick = () => {
    mapa.ocultarDistritos()
    mapa.mostrarSecciones()
}