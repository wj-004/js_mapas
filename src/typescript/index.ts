import { configurarElementosDeInterfaz } from "./app/interfaz/configurarElementosDeInterfaz";
import { mostrarMapa } from "./app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "./app/interfaz/quitarDialogoCarga";
import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { enfocarZonaGuardada } from "./app/mapa/enfocarFeatureGuardado";
import { escucharEventosDeLivewire } from "./app/navegador/configurarListenersDelNavegador";
import { Mapa } from "./mapa/Mapa";
import { MapaDeBuenosAires } from "./mapa/MapDeBuenosAires";
import { descargarZonas } from "./util/descargarZona";
import { livewireEmit } from "./util/livewireEmit";

window.onload = inicializar

async function inicializar() {
    const mapa = new MapaDeBuenosAires(document.querySelector("#idSecciones"));

    await mapa.inicializar();

    window['mapa'] = mapa;

    mapa.interfaz.municipios.alHacerClick(() => {
        livewireEmit('clickEnTodosLosMunicipios')
    })

    mapa.interfaz.secciones.alHacerClick(() => {
        livewireEmit('clickEnTodasLasSecciones')
    })
    
    configurarListenersDelMapa(mapa)
    // configurarElementosDeInterfaz(mapa)
    escucharEventosDeLivewire(mapa)
    enfocarZonaGuardada(mapa)

    livewireEmit('mapaListo');
    dispatchEvent(new CustomEvent('mapaListo', { detail: mapa }));
}