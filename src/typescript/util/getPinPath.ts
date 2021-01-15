export function getPinPath(tipo: string, entidad: string): string {
    let fullPath = '';

    if (tipo == 'TRIBUNALES') {
        switch (entidad.toUpperCase()) {
            case 'PENAL':
                fullPath = 'img/pines/judiciales/PIN-01-PENAL.png'
                break;

            case 'CIVIL Y COMERCIAL':
                fullPath = 'img/pines/judiciales/PIN-04-CIVIL.png'
                break;

            case 'FAMILIA':
                fullPath = 'img/pines/judiciales/PIN-03-FAMILIA.png'
                break;

            case 'CONTENCIOSO ADMINISTRATIVO':
                fullPath = 'img/pines/judiciales/PIN-06-ADMINISTRATIVO.png'
                break;

            case 'LABORAL':
                fullPath = 'img/pines/judiciales/PIN-05-LABORAL.png'
                break;

            case 'PAZ':
                fullPath = 'img/pines/judiciales/PIN-02-PAZ.png'
                break;

            case 'TODOS':
                fullPath = 'img/pines/judiciales/PIN-07-TODOS.png'
                break;

            default:
                break;
        }
    }
    if (tipo == 'ORGANISMOS') {
        switch (entidad.toUpperCase()) {
            case 'AFIP':
                fullPath = 'img/pines/organismos/PIN-08.png'    //GRIS OSCURO
                break;

            case 'ANSES':
                fullPath = 'img/pines/organismos/PIN-02.png'    //CELESTE
                break;

            case 'ARBA':
                fullPath = 'img/pines/organismos/PIN-09.png'    //CELESTE MAS CLARO
                break;

            case 'BANCO NACION':
                fullPath = 'img/pines/organismos/PIN-04.png'    //AZUL
                break;

            case 'BANCO PROVINCIA':
                fullPath = 'img/pines/organismos/PIN-05.png'    //VERDE
                break;

            case 'CORREO ARGENTINO':
                fullPath = 'img/pines/organismos/PIN-06.png'    //AMARILLO
                break;

            case 'PAMI':
                fullPath = 'img/pines/organismos/PIN-10.png'    //AZUL OSCURO
                break;

            default:
                break;
        }
    }

    return fullPath;
}