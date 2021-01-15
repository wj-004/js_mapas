export function limpiarStorage(evento: any) {
    localStorage.clear()
    window.location.href = evento.detail.data;
}