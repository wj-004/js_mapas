export class Button {

    private callbacks: (() => void)[] = []

    constructor(private boton: HTMLButtonElement) {
        boton.onclick = () => {
            for (let callback of this.callbacks) {
                callback()
            }
        }
    }

    alHacerClick(cb: () => void) {
        this.callbacks.push(cb)
    }
}