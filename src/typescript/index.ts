import { Mapa } from "./Mapa";

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

const showMapStreets: HTMLInputElement = document.querySelector("#showMapStreets")
showMapStreets.onchange = () => {
    if (showMapStreets.checked) {
        mapa.mostrarCalles()
    } else {
        mapa.ocultarCalles()
    }
}

const initialShow: HTMLButtonElement = document.querySelector("#initialShow")
initialShow.onclick = () => {
    mapa.ocultarDistritosEnfocados()
    mapa.mostrarSecciones()
    mapa.enfocarBuenosAires()
}