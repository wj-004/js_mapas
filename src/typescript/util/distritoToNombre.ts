import { Feature } from "ol";

export function distritoToNombre(distrito: Feature): string {
    return distrito.get('departamento')
}