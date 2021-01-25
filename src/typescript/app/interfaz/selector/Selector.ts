import { DistritosPorIdSeccion } from "../../../data/DistritosPorSeccion";
import { MapaDeBuenosAires } from "../../../mapa/MapDeBuenosAires";
import { aTitulo } from "../../../util/aTitulo";

const TODOS_LOS_MUNICIPIOS_O_SECCIONES = -1;
const MUNICIPIOS_DE_SECCION_ACTUAL = -2;

type Opcion = { nombre: string, valor: number }
type EstadoSelector = {
    capa: 'municipios' | 'secciones'
    opciones: Opcion[]
    seccion?: number
    valor: number
    valorOpcionTodos: number
}
export class Selector {
    private _estado: EstadoSelector

    constructor(
        private select: HTMLSelectElement,
        private opcionesPorCapa: { [capa: string]: Opcion[] },
        private mapa: MapaDeBuenosAires,
    )
    {
        for (let capa in this.opcionesPorCapa) {
            this.opcionesPorCapa[capa] = this.opcionesPorCapa[capa]
                .map(opcion => ({ nombre: aTitulo(opcion.nombre), valor: opcion.valor }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
        }

        this.select.onchange = () => this.onChange(Number(select.value))

        this.mapa.alClickearMunicipio(id => this.alClickearMunicipio(id))
        this.mapa.alClickearSeccion(id => this.alClickearSeccion(id))
        this.mapa.alCambiarCapa(capa => this.alCambiarCapa(capa))

        this.estado = {
            capa: 'municipios',
            opciones: this.opcionesPorCapa['municipios'],
            valor: TODOS_LOS_MUNICIPIOS_O_SECCIONES,
            valorOpcionTodos: TODOS_LOS_MUNICIPIOS_O_SECCIONES,
        }
    }

    private set estado(e: EstadoSelector) {
        this.quitarOpciones()
        this.agregarOpcion({ nombre: 'Todos', valor: e.valorOpcionTodos });
        for (let opcion of e.opciones) {
            this.agregarOpcion(opcion)
        }
        this.select.value = String(e.valor);
        this._estado = e
    }

    private get estado(): EstadoSelector {
        return this._estado
    }

    private onChange(valor: number) {
        const estadoAnterior = this.estado
        this.estado = this.proximoEstado(estadoAnterior, valor)
        this.actualizarMapa(estadoAnterior, this.estado)
    }

    private actualizarMapa(estadoPrevio: EstadoSelector, estadoActual: EstadoSelector) {
        if (estadoPrevio.capa === 'secciones' && estadoActual.capa === 'municipios') {
            this.mapa.enfocarMunicipiosDeSeccion(estadoActual.seccion)
            return
        }

        if (estadoPrevio.capa === 'secciones' && estadoActual.capa === 'municipios' && estadoActual.valor === MUNICIPIOS_DE_SECCION_ACTUAL) {
            this.mapa.enfocarMunicipiosDeSeccion(estadoActual.valor)
            return
        }

        if (estadoActual.capa === 'municipios') {
            if (estadoActual.valor === TODOS_LOS_MUNICIPIOS_O_SECCIONES) {
                this.mapa.municipios()
                return
            } else {
                this.mapa.mostrarSoloZona([estadoActual.valor])
                return
            }
        }
    }

    private proximoEstado(estadoAnterior: EstadoSelector, valorSeleccionado: number): EstadoSelector {
        let capa = estadoAnterior.capa
        let opciones = estadoAnterior.opciones
        let seccion = estadoAnterior.seccion
        let valor = valorSeleccionado
        let valorOpcionTodos = estadoAnterior.valorOpcionTodos

        if (estadoAnterior.capa === 'secciones' && valorSeleccionado !== MUNICIPIOS_DE_SECCION_ACTUAL) {
            capa = 'municipios'

            const municipios: number[] = DistritosPorIdSeccion[valorSeleccionado]
            opciones = this.opcionesPorCapa['municipios']
                .filter(o => municipios.includes(o.valor))

            seccion = valorSeleccionado

            valor = valorOpcionTodos = TODOS_LOS_MUNICIPIOS_O_SECCIONES
        }

        return { capa, opciones, seccion: seccion, valor: valor, valorOpcionTodos }
    }

    /**
     * Callback que se ejecuta cada vez que se clickea un municipio
     */
    private alClickearMunicipio(id: number) {
        this.estado = {
            capa: 'municipios',
            opciones: this.estado.opciones,
            valor: id,
            valorOpcionTodos: TODOS_LOS_MUNICIPIOS_O_SECCIONES,
            seccion: null
        }
    }

    private alClickearSeccion(id: number) {
        const municipios: number[] = DistritosPorIdSeccion[id]
        const opciones = this.opcionesPorCapa['municipios']
            .filter(o => municipios.includes(o.valor))

        this.estado = {
            capa: 'municipios',
            opciones,
            valor: MUNICIPIOS_DE_SECCION_ACTUAL,
            valorOpcionTodos: MUNICIPIOS_DE_SECCION_ACTUAL,
            seccion: null
        }
    }

    private alCambiarCapa(capa: string) {
        this.estado = {
            capa: capa as any,
            opciones: this.opcionesPorCapa[capa],
            valorOpcionTodos: TODOS_LOS_MUNICIPIOS_O_SECCIONES,
            valor: TODOS_LOS_MUNICIPIOS_O_SECCIONES,
            seccion: null
        }
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