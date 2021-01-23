import { Mapa } from "../../../mapa/Mapa";

type Evento = {
    detail: {
        data: Distrito[]
    }
}

type Distrito = { id: number, seccion_id: number }

export function pintarDepartamentosJudiciales(mapa: Mapa) {
    return evento => {
        // Separar distritos por seccion (en el futuro seran separados por depto judicial)
        const distritos = (evento as Evento).detail.data
        const distritosPorSeccion = agrupar(distritos, d => d.seccion_id)

        for (let grupoId in distritosPorSeccion) {
            const color = unColor();
            const estiloMunicipios = distritosPorSeccion[grupoId]
                .map(m => ({ id: m.id, relleno: color.relleno, borde: color.borde }));
            mapa.setEstado({ estilos: estiloMunicipios })
        }
    }
}

function agrupar<A>(datos: A[], criterio: (a: A) => number): { [id: number]: A[] } {
    const grupos: { [id: number]: A[] } = {}

    for (let a of datos) {
        const grupoId = criterio(a)
        if (!grupos[grupoId]) {
            grupos[grupoId] = []
        }
        grupos[grupoId].push(a)
    }

    return grupos
}

/**
 * Devuelve un par de colores cualquiera de la paleta de abajo
 */
function unColor(): { borde: string, relleno: string } {
    let i =  Math.round(Math.random() * paleta.length)
    i = i == paleta.length
        ? i - 1
        : i
    const relleno = paleta[i]
    const borde = i <= 4
        ?   paleta[paleta.length - 1]
        :   paleta[0];
    return { relleno, borde }
}

/**
 * Paleta de colores que se va a usar hasta tener los valores reales
 */
const paleta = [
    '#ffba08',  // Amarillo
    '#faa307',
    '#f48c06',
    '#e85d04',
    '#d00000',
    '#dc2f02',
    '#9d0208',
    '#6a040f',
    '#370617',
    '#03071e',  // Negro azulado
]