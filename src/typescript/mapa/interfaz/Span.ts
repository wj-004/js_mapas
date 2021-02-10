export class Span {
    constructor(private elemento: HTMLSpanElement) {}

    setTexto(texto: string) {
        this.elemento.textContent = texto;
    }
}