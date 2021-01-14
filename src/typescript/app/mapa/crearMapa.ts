import { Mapa } from "../../mapa/Mapa";
import { getLayers } from "../../util/getLayer";
import { alClickearDistrito } from "./eventos/alClickearDistrito";
import { alEnfocar } from "./eventos/alEnfocar";

export async function crearMapa(): Promise<Mapa> {
    const capas = await getLayers([
        '../data/vector_data/bsas_provincia_localidades.geojson',
        '../data/vector_data/bsas_provincia_distritos.geojson',
        '../data/vector_data/bsas_provincia_secciones.geojson',
        '../data/vector_data/contorno_relleno.geojson'
    ])
  
    const mapa = new Mapa(document.querySelector("#map"), capas)

    mapa.alClickearCualquierDistrito(alClickearDistrito)

    mapa.alEnfocar(alEnfocar);

    return mapa;
}