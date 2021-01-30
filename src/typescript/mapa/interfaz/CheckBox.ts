import { Input } from "./Input";

export class Checkbox extends Input {
    marcar() {
        this.input.checked = true
    }

    desmarcar() {
        this.input.checked = false
    }
}