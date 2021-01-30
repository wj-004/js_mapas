import { limpiarStorage } from "./eventos/limpiarStorage";
import { showMapa } from "./eventos/showMap";
import { pintarDistritosIntendents } from "../mapa/eventos/pintarDistritosIntendents";
import { pintarDepartamentosJudiciales } from "./eventos/pintarDepartamentosJudiciales";
import { MapaDeBuenosAires } from "../../mapa/MapDeBuenosAires";

export function escucharEventosDeLivewire(mapa: MapaDeBuenosAires) {
    window.addEventListener('pintarDistritosIntendentes', pintarDistritosIntendents(mapa));

    window.addEventListener('pintarDepartamentosJudiciales', pintarDepartamentosJudiciales(mapa));

    window.addEventListener('clickEnLaLupita', showMapa(mapa))

    window.addEventListener('limpiarStorage', limpiarStorage)
}