import { Mapa } from "../../../mapa/Mapa";

export function clickBotonRestaurar(boton: HTMLButtonElement, mapa: Mapa) {
    return () => {
        mapa.ocultarDistritosEnfocados()
        mapa.mostrarSecciones()
        mapa.enfocarBuenosAires()
        localStorage.removeItem('FeatureEnfocado')
    }
}