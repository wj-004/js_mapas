import { Mapa } from "../../../mapa/Mapa";
/**
 * Mustra la capa de distritos y enfoca toda la provincia.
 * 
 * Este boton hace lo mismo que el de municipios. Creo que deberiamos
 * quitarlo.
 * 
 * @param boton 
 * @param mapa 
 * @param switchCalles PARCHE: en lo posible este argumento no deberia ir aqui
 */
export function clickBotonRestaurar(boton: HTMLButtonElement, mapa: Mapa, switchCalles: HTMLInputElement) {
    return () => {
        mapa.enfocarMunicipios()
        switchCalles.checked = false
        document.querySelector("#showMapStreetsLabel").classList.add('d-none') // PROBLEMA?: esto esta duplicado, se hace lo mismo en otro lado
        localStorage.removeItem('EstadoMapa')
    }
}