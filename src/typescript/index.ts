import { configurarElementosDeInterfaz } from "./app/interfaz/configurarElementosDeInterfaz";
import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { crearMapa } from "./app/mapa/crearMapa";
import { enfocarZonaGuardada } from "./app/mapa/enfocarFeatureGuardado";
import { configurarListenersDelNavegador } from "./app/navegador/configurarListenersDelNavegador";
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

    // Quitar dialogo de carga
    const dialogoCargaContainer = document.querySelector('.dialogo-carga--container')
    dialogoCargaContainer.classList.add('d-none')
    dialogoCargaContainer.classList.remove('d-flex')
    
    // Mostrar mapa y sus controles
    document.querySelector('.mapa--container').classList.remove('d-none')
    document.querySelector('.mapa--controles').classList.remove('d-none')

    const mapa = crearMapa(capas)
    
    configurarListenersDelMapa(mapa)
    configurarElementosDeInterfaz(mapa)
    configurarListenersDelNavegador(mapa)
    enfocarZonaGuardada(mapa)

    window['mapa'] = mapa;

    livewireEmit('mapaListo');
}