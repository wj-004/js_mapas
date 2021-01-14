import { Mapa } from "./mapa/Mapa";
import { Nivel } from "./mapa/Nivel";

window.onload = inicializar

function inicializar() {
    const mapa = new Mapa(document.querySelector("#map"))

    mapa
        .iniciarlizar()
        .then(() => {
            const featureEnfocadoMaybe = localStorage.getItem('FeatureEnfocado')
            if (!!featureEnfocadoMaybe) {
                const { nivel, id } = JSON.parse(featureEnfocadoMaybe)
                mapa.enfocarFeatureEnNivel(id, nivel)
                // Emitir el evento de LW correspondiente
            }
        })
    
    window['mapa'] = mapa;

    mapa.alClickearCualquierDistrito(id => {
        // @ts-ignore
        if (typeof livewire !== 'undefined') {
            // @ts-ignore
            livewire.emit('verDetalle', { id })
        }
    })

    mapa.alEnfocar(evento => {
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
    });

    window.addEventListener('show-map', (evento: any) => {
        console.log(evento)
        const id = evento.detail.data.id as number;
        mapa.enfocarDistritoPorId(id)
    })
    
    const botonEnfocarDistritos: HTMLButtonElement = document.querySelector("#showDistritos")
    botonEnfocarDistritos.onclick = () => {
        mapa.enfocarDistritos()
    }
    
    const botonEnfocarSecciones: HTMLButtonElement = document.querySelector("#showSecciones")
    botonEnfocarSecciones.onclick = () => {
        mapa.enfocarSecciones()
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
        localStorage.removeItem('FeatureEnfocado')
    }
    
    const select: HTMLSelectElement = document.querySelector("#idSecciones")
    select.onchange = () => {
        const id = Number(select.value)
        if (id === -1) {
            switch (mapa.nivel) {
                case Nivel.TODAS_LAS_SECCIONES:
                    mapa.enfocarSecciones()
                    break
                case Nivel.TODOS_LOS_DISTRITOS:
                    mapa.enfocarDistritos()
                    break
                case Nivel.UNA_SECCION:
                    break
                case Nivel.UN_DISTRITO:
                    break
            }
        } else {
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
    }
}