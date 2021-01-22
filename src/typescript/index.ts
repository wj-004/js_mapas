import { configurarElementosDeInterfaz } from "./app/interfaz/configurarElementosDeInterfaz";
import { mostrarMapa } from "./app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "./app/interfaz/quitarDialogoCarga";
import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { enfocarZonaGuardada } from "./app/mapa/enfocarFeatureGuardado";
import { configurarListenersDelNavegador } from "./app/navegador/configurarListenersDelNavegador";
import { Mapa } from "./mapa/Mapa";
import { descargarZonas } from "./util/descargarZona";
import { livewireEmit } from "./util/livewireEmit";

window.onload = inicializar

async function inicializar() {
    // Esperar que se descarguen los datos para el mapa
    const zonas = await descargarZonas([
        '../data/vector_data/bsas_provincia_distritos.geojson',
        '../data/vector_data/bsas_provincia_secciones.geojson',
        '../data/vector_data/contorno_relleno.geojson'
    ]);

    quitarDialogoCarga()
    mostrarMapa()

    const mapa = new Mapa(
        document.querySelector("#map"),
        document.querySelector("#idSecciones"),
        zonas[2],
        [
            { nombre: 'municipios', zonas: zonas[0] },
            { nombre: 'secciones', zonas: zonas[1] }
        ]
    )

    window['mapa'] = mapa;

    mapa.setEstado({ capas: ['municipios'] })
    
    configurarListenersDelMapa(mapa)
    configurarElementosDeInterfaz(mapa)
    configurarListenersDelNavegador(mapa)
    enfocarZonaGuardada(mapa)

    livewireEmit('mapaListo');
}