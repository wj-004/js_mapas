import { Feature } from "ol";
import { Nivel } from "../Nivel";

export class EventoEnfocar {

    readonly id: number;
    readonly nombre: string;

    constructor(readonly nivel: Nivel, feature: Feature) {
        switch (nivel) {
            case Nivel.TODAS_LAS_SECCIONES:
            case Nivel.TODOS_LOS_DISTRITOS:
                break
            default: {
                this.id = Number(feature.get('id'))

                this.nombre = !!feature.get('nombreSeccion')
                ? feature.get('nombreSeccion')
                : feature.get('nombreDistrito')
            }
        }
    }
}