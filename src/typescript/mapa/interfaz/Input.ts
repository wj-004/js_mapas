export class Input {

    private callbacks: ((input: HTMLInputElement) => void)[] = []

    constructor(protected input: HTMLInputElement) {
        input.onchange = () => {
            for (let callback of this.callbacks) {
                callback(input)
            }
        }
    }

    alHacerClick(cb: (i: HTMLInputElement) => void) {
        this.callbacks.push(cb)
    }

    ocultar() {
        this.input.classList.add('d-none')
    }

    mostrar() {
        this.input.classList.remove('d-none')
    }
}