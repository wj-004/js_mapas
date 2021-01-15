import { configurarElementosDeInterfaz } from "./app/interfaz/configurarElementosDeInterfaz";
import { configurarListenersDelMapa } from "./app/mapa/configurarListenersDelMapa";
import { crearMapa } from "./app/mapa/crearMapa";
import { enfocarZonaGuardada } from "./app/mapa/enfocarFeatureGuardado";
import { configurarListenersDelNavegador } from "./app/navegador/configurarListenersDelNavegador";

window.onload = inicializar

async function inicializar() {
    const mapa = await crearMapa()
    
    configurarListenersDelMapa(mapa)
    configurarElementosDeInterfaz(mapa)
    configurarListenersDelNavegador(mapa)
    enfocarZonaGuardada(mapa)

    window['mapa'] = mapa;
}