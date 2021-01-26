export type Referencia = { nombre: string, relleno?: string, borde?: string }

export class DisplayReferencias {

    private _referencias: Referencia[] = []

    constructor(private contenedor: HTMLDivElement) {}

    set referencias(rs: Referencia[]) {
        this._referencias = rs
        this.vaciarContenedor()
        for (let r of rs) {
            const referencia = this.crearReferencia(r)
            this.contenedor.appendChild(referencia)
        }
    }

    private vaciarContenedor() {
        while (this.contenedor.firstChild) {
            this.contenedor.removeChild(this.contenedor.firstChild)
        }
    }

    private crearReferencia(r: Referencia): HTMLDivElement {
        const div = document.createElement('div')
        div.classList.add('referencia')

        if (r.relleno || r.borde) {
            const circulo = document.createElement('span')
            circulo.classList.add('circulo')
            if (r.relleno) {
                circulo.style.background = r.relleno
            }
            if (r.borde) {
                circulo.style.background = r.borde
            }
            div.appendChild(circulo)
        }

        const texto = document.createElement('span')
        texto.appendChild(document.createTextNode(r.nombre))

        div.appendChild(texto)

        return div;
    }
}