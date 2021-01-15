import { Mapa } from "../../../mapa/Mapa";
import { EntidadesJudicialesBsAs } from '../../../data/EntidadesJudiciales';

export function mostrarPines(mapa: Mapa) {
    return evento => {
        if (evento && evento.detail && evento.detail.data) {
            const tipoEvento = evento.detail.data.type;
            if (tipoEvento == 'ORGANISMOS') {
                mapa.deleteIconFeatures();

                /* COMENTADO PARA CARGA MANUAL - DESCOMENTAR LUEGO AL PODER RECIBIR LOS PINES
                const entidades = evento.detail.data.distritos;
                if (!entidades) {
                    console.debug('ERROR mostrarPines event: ORGANISMOS -> ..data.distritos no existe');
                }
                entidades.forEach(entidad => {
                    mapa.mostrarPinesDeOrganismosEnDistrito(entidad.id, entidad.tipo, entidad.longitud ?? '', entidad.latitud ?? '');
                });*/

                //INICIO CARGA MANUAL
                const entidades = EntidadesJudicialesBsAs;
                entidades.forEach(entidad => {
                    mapa.mostrarPinesDeOrganismosEnDistrito(entidad.Nombre, entidad.Fuero, [entidad.Longitud, entidad.Latitud]);
                });
                //FIN CARGA MANUAL
            }
            if (tipoEvento == 'TRIBUNALES') {
                mapa.deleteIconFeatures();
                const entidades = EntidadesJudicialesBsAs;
                entidades.forEach(entidad => {
                    mapa.mostrarPinesEntidadesJudiciales(entidad.Nombre, entidad.Fuero, [entidad.Longitud, entidad.Latitud]);
                });
            }
        }
        else {
            console.debug('ERROR mostrarPines event. No existe evento.detail.data')
        }
    }
}