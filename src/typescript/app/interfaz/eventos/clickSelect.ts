import { Mapa } from "../../../mapa/Mapa";
import { Nivel } from "../../../mapa/Nivel";

export function clickSelect(select: HTMLSelectElement, mapa: Mapa) {
    return () => {
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
                case Nivel.UN_DISTRITO:
                    mapa.enfocarDistritoPorId(id)
                    break
            }
        }
    }
}