import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { aplicarEstadoGuardado } from "./app/mapa/enfocarFeatureGuardado";
import { escucharEventosDeLivewire } from "./app/navegador/configurarListenersDelNavegador";
import { MapaDeBuenosAires } from "./mapa/MapDeBuenosAires";
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

    mapa.interfaz.restaurar.alHacerClick(() => {
        livewireEmit('clickEnRestaurar')
    })
    
    configurarListenersDelMapa(mapa)
    escucharEventosDeLivewire(mapa)
    aplicarEstadoGuardado(mapa)

    livewireEmit('mapaListo');
    dispatchEvent(new CustomEvent('mapaListo', { detail: mapa }));
}