import { Mapa } from "../../../mapa/Mapa";
import { EntidadesJudicialesBsAs } from '../../../data/EntidadesJudiciales';

export function mostrarPines(mapa: Mapa) {
    return evento => {
        const tipoEvento = evento.detail.tipo;
        if (tipoEvento == 'ORGANISMOS') {
            throw new Error('ORGANISMOS Aun no esta implementado!!')
        } else {
            if (tipoEvento == 'TRIBUNALES') {
                mapa.deleteIconFeatures();
                const entidades = EntidadesJudicialesBsAs;
                entidades.forEach(entidad => {
                    mapa.mostrarPinesEntidadesJudiciales(entidad.Nombre, entidad.Fuero, [entidad.Longitud, entidad.Latitud]);
                });
            }
        }
    }
}