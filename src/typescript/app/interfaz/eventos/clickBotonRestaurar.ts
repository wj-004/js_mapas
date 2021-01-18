import { Mapa } from "../../../mapa/Mapa";
/**
 * 
 * @param boton 
 * @param mapa 
 * @param switchCalles PARCHE: en lo posible este argumento no deberia ir aqui
 */
export function clickBotonRestaurar(boton: HTMLButtonElement, mapa: Mapa, switchCalles: HTMLInputElement) {
    return () => {
        mapa.soloOcultarCapaOpenStreetMap()
        mapa.ocultarDistritosEnfocados()
        mapa.ocultarSecciones()
        mapa.mostrarDistritos()
        mapa.enfocarBuenosAires()
        mapa.ponerNivelEnTodosLosDistritos() // PARCHE, quitar
        mapa.mostrarTodosLosIconos() // PARCHE, quitar
        switchCalles.checked = false
        document.querySelector("#showMapStreetsLabel").classList.add('d-none') // PROBLEMA?: esto esta duplicado, se hace lo mismo en otro lado
        localStorage.removeItem('FeatureEnfocado')
    }
}