import { Nivel } from "../../../mapa/Nivel"

export function alEnfocar(evento: { nivel: Nivel }) {
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