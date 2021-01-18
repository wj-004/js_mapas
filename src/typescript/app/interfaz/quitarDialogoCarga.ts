export function quitarDialogoCarga() {
    const dialogoCargaContainer = document.querySelector('.dialogo-carga--container')
    dialogoCargaContainer.classList.add('d-none')
    dialogoCargaContainer.classList.remove('d-flex')
}