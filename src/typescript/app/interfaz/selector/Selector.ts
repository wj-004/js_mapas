import { DistritosPorIdSeccion } from "../../../data/DistritosPorSeccion";
import { Estado } from "../../../mapa/Mapa";
import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires";
import { aTitulo } from "../../../util/aTitulo";
import { Funcion } from "../../../util/Funcion";

const OPCION_TODOS = -1;

type Opcion = { nombre: string, valor: number }

export class Selector {

    private capaActual: string

    private callbackAlSeleccionar: Funcion<number, void>

    constructor(
        private select: HTMLSelectElement,
        private opcionesPorCapa: { [capa: string]: Opcion[] },
        private mapa: MapaDeBuenosAires,
    )
    {
        this.limpiarOpciones();

        this.select.onchange = () => this.onChange(Number(select.value))

        this.mapa.alClickearMunicipio(id => this.alClickearMunicipio(id))
        this.mapa.alClickearSeccion(id => this.alClickearSeccion(id))
        this.mapa.alCambiarCapa(capa => this.alCambiarCapa(capa))

        this.actualizarOpciones(this.opcionesPorCapa['municipios'], OPCION_TODOS)
    }

    private onChange(id: number) {
        console.log('Select!!')
        if (id !== OPCION_TODOS) {
            switch (this.capaActual) {
                case 'secciones':
                    this.mapa.enfocarMunicipiosDeSeccion(id)
                    this.mostrarMunicipiosDeSeccion(id)
                    this.capaActual = 'municipios'
                    break
                case 'municipios':
                    this.mapa.mostrarSoloZona([id])
                    this.select.value = String(id)
                    if (this.callbackAlSeleccionar) {
                        this.callbackAlSeleccionar(id)
                    }
                    break
                default:
                    break
            }
        } else {

        }
    }

    /**
     * Callback que se ejecuta cada vez que se clickea un municipio
     */
    private alClickearMunicipio(id: number) {
        this.capaActual = 'municipios'
        this.actualizarOpciones(this.opcionesPorCapa['municipios'], id);
    }

    private alClickearSeccion(id: number) {
        this.capaActual = 'municipios'
        this.mostrarMunicipiosDeSeccion(id)
    }

    private alCambiarCapa(capa: string) {
        this.capaActual = capa
        const opciones = this.opcionesPorCapa[capa]
        this.actualizarOpciones(opciones, OPCION_TODOS)
    }

    private mostrarMunicipiosDeSeccion(id: number) {
        const municipios: number[] = DistritosPorIdSeccion[id]
        const opciones = this.opcionesPorCapa['municipios']
            .filter(o => municipios.includes(o.valor))
        this.actualizarOpciones(opciones, OPCION_TODOS);
    }

    /**
     * Ordena las opciones y hace que cada palabra de su nombre arranque con mayuscula.
     */
    private limpiarOpciones() {
        for (let capa in this.opcionesPorCapa) {
            this.opcionesPorCapa[capa] = this.opcionesPorCapa[capa]
                .map(opcion => ({ nombre: aTitulo(opcion.nombre), valor: opcion.valor }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
        }
    }

    private actualizarOpciones(opciones: Opcion[], valorActual: number) {
        this.quitarOpciones()
        this.agregarOpcion({ nombre: 'Todos', valor: -1 });
        for (let opcion of opciones) {
            this.agregarOpcion(opcion)
        }
        this.select.value = String(valorActual);
    }

    private agregarOpcion(opcion: Opcion) {
        const tag = this.crearOptionTag(opcion.nombre, opcion.valor)
        this.select.appendChild(tag)
    }

    private quitarOpciones() {
        while (this.select.firstChild) {
            this.select.removeChild(this.select.firstChild)
        }
    }

    private crearOptionTag(nombre: string, valor: number) {
        const tag: HTMLOptionElement = document.createElement('option')
        tag.value = String(valor)
        tag.appendChild(document.createTextNode(nombre))
        return tag
    }
}