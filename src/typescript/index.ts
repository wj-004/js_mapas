import { configurarElementosDeInterfaz } from "./app/interfaz/configurarElementosDeInterfaz";
import { mostrarMapa } from "./app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "./app/interfaz/quitarDialogoCarga";
import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { enfocarZonaGuardada } from "./app/mapa/enfocarFeatureGuardado";
import { configurarListenersDelNavegador } from "./app/navegador/configurarListenersDelNavegador";
import { Mapa } from "./mapa/Mapa";
import { getLayers } from "./util/getLayer";
import { livewireEmit } from "./util/livewireEmit";

window.onload = inicializar

async function inicializar() {
    // Esperar que se descarguen los datos para el mapa
    const capas = await getLayers([
        '../data/vector_data/bsas_provincia_distritos.geojson',
        '../data/vector_data/bsas_provincia_secciones.geojson',
        '../data/vector_data/contorno_relleno.geojson'
    ]);

    quitarDialogoCarga()
    mostrarMapa()

    const mapa = new Mapa(
        document.querySelector("#map"),
        document.querySelector("#idSecciones"),
        capas[2],
        [
            { nombre: 'municipios', layer: capas[0] },
            { nombre: 'secciones', layer: capas[1] }
        ]
    )

    mapa.setEstado({ capas: ['municipios'] })
    
    configurarListenersDelMapa(mapa)
    configurarElementosDeInterfaz(mapa)
    configurarListenersDelNavegador(mapa)
    enfocarZonaGuardada(mapa)

    window['mapa'] = mapa;

    livewireEmit('mapaListo');
}