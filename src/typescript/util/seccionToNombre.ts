import { Feature } from "ol";

export function seccionToNombre(seccion: Feature): string {
    return seccion.get('nombreSeccion')
}