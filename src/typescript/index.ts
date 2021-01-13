import { Mapa } from "./Mapa";
import { Nivel } from "./Nivel";

const mapa = new Mapa(document.querySelector("#map"))

mapa.iniciarlizar()

const showDistritos: HTMLButtonElement = document.querySelector("#showDistritos")
showDistritos.onclick = () => {
    mapa.ocultarSecciones()
    mapa.mostrarDistritos()
    mapa.enfocarBuenosAires()
}

const showSecciones: HTMLButtonElement = document.querySelector("#showSecciones")
showSecciones.onclick = () => {
    mapa.ocultarDistritos()
    mapa.mostrarSecciones()
    mapa.enfocarBuenosAires()
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

const select: HTMLSelectElement = document.querySelector("#idSecciones")
select.onchange = () => {
    const id = Number(select.value)
    switch (mapa.nivel) {
        case Nivel.TODAS_LAS_SECCIONES:
            mapa.enfocarSeccionPorId(id)
            break
        case Nivel.TODOS_LOS_DISTRITOS:
            mapa.enfocarDistritoPorId(id)
            break
        case Nivel.UNA_SECCION:
            mapa.enfocarDistritoPorId(id)
            break
    }
}