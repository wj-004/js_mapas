import { Mapa } from "../../../mapa/Mapa";
import { EntidadesJudicialesBsAs } from '../../../data/EntidadesJudiciales';

export function mostrarPines(mapa: Mapa) {
    return evento => {
        if (evento && evento.detail) {
            const tipoEvento = evento.detail.type;
            if (tipoEvento == 'ORGANISMOS') {
                throw new Error('ORGANISMOS Aun no esta implementado!!')
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
            return;
        }
    }
}