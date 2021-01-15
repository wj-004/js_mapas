/**
 * Convierte una cadena a una donde cada palabra empieza con mayuscula.
 * 
 * @param texto 
 */
export function aTitulo(texto: string) {
    return texto
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(primerLetraMayuscula)
        .join(' ')
}

function primerLetraMayuscula(palabra: string) {
    return palabra.charAt(0).toLocaleUpperCase() + palabra.slice(1).toLocaleLowerCase()
}