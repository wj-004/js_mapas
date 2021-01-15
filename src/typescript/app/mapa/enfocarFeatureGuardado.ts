import { Mapa } from "../../mapa/Mapa"

export function enfocarZonaGuardada(mapa: Mapa) {
    const featureEnfocadoMaybe = localStorage.getItem('FeatureEnfocado')
    if (!!featureEnfocadoMaybe) {
        const { nivel, id } = JSON.parse(featureEnfocadoMaybe)
        mapa.enfocarFeatureEnNivel(id, nivel)
    }
}