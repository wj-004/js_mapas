import { Estado } from "../../../mapa/Mapa"
import { aTitulo } from "../../../util/aTitulo"

export function alEnfocar(estadoMapa: Estado) {
    localStorage.setItem('EstadoMapa', JSON.stringify(estadoMapa))
    establecerUbicacion(estadoMapa)
    mostrarUocultarSwitchDeCalles(estadoMapa)
}

/**
 * Establece el nombre de la seccion/municipio/zona en el titulo del mapa.
 * 
 * NO FUNCIONA (21/01/2021)
 */
function establecerUbicacion(estadoMapa: Estado) {    
    // const tagUbicacion = document.querySelector('#ubicacion')

    // if (tagUbicacion.hasChildNodes()) {
    //     tagUbicacion.removeChild(tagUbicacion.lastChild)
    // }

    // if (!!evento.nombre) {
    //     tagUbicacion.appendChild(document.createTextNode("- " + aTitulo(evento.nombre)))
    // }
}

/**
 * NO FUNCIONA (21/01/2021)
 * 
 * El toggle de calles se muestra si se cumple las siguientes dos:
 *  - La capa actual es la de municipios/distritos
 *  - Hay una o mas zonas enfocadas
 */
function mostrarUocultarSwitchDeCalles(estadoMapa: Estado) {
    const toggle = document.querySelector("#showMapStreetsLabel") as HTMLLabelElement
    const capa = estadoMapa.capas.length > 0
        ? estadoMapa.capas[estadoMapa.capas.length - 1]
        : null
    if (capa === 'municipios' && estadoMapa.enfoque.length == 1) {
        toggle.classList.remove('d-none')
    } else {
        toggle.classList.add('d-none')
    }
}