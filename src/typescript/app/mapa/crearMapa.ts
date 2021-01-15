import { Mapa } from "../../mapa/Mapa";
import { getLayers } from "../../util/getLayer";

export async function crearMapa(): Promise<Mapa> {
    const capas = await getLayers([
        '../data/vector_data/bsas_provincia_distritos.geojson',
        '../data/vector_data/bsas_provincia_secciones.geojson',
        '../data/vector_data/contorno_relleno.geojson'
    ])

    return new Mapa(document.querySelector("#map"), capas);
}