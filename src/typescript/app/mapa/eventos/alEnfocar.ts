import { EventoEnfocar } from "../../../mapa/eventos/EventoEnfocar"
import { Nivel } from "../../../mapa/Nivel"
import { aTitulo } from "../../../util/aTitulo"

export function alEnfocar(evento: EventoEnfocar) {
    guardarOremoverZonaEnfocada(evento)
    establecerUbicacion(evento)
}

function guardarOremoverZonaEnfocada(evento: EventoEnfocar) {
    switch (evento.nivel) {
        case Nivel.TODAS_LAS_SECCIONES:
        case Nivel.TODOS_LOS_DISTRITOS:
            localStorage.removeItem('FeatureEnfocado')
            break
        case Nivel.UNA_SECCION:
        case Nivel.UN_DISTRITO:
            localStorage.setItem('FeatureEnfocado', JSON.stringify(evento))
            break
    }
}

function establecerUbicacion(evento: EventoEnfocar) {    
    const tagUbicacion = document.querySelector('#ubicacion')

    if (tagUbicacion.hasChildNodes()) {
        tagUbicacion.removeChild(tagUbicacion.lastChild)
    }

    if (!!evento.nombre) {
        tagUbicacion.appendChild(document.createTextNode("- " + aTitulo(evento.nombre)))
    }
}