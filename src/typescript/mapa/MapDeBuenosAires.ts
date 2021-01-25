import { mostrarMapa } from "../app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "../app/interfaz/quitarDialogoCarga";
import { DistritosPorIdSeccion } from "../data/DistritosPorSeccion";
import { aTitulo } from "../util/aTitulo";
import { descargarZonas } from "../util/descargarZona";
import { Funcion } from "../util/Funcion";
import { livewireEmit } from "../util/livewireEmit";
import { Estado, EstiloZona, Mapa } from "./Mapa";

export class MapaDeBuenosAires {

    private mapa: Mapa

    private estiloMunicipios: EstiloZona[] = []

    private nombresMunicipios: { valor: number, nombre: string }[] = []
    private nombresSecciones: { valor: number, nombre: string }[] = []

    private callbackAlEnfocar:              Funcion<Estado, void>[] = [];
    private callbackAlClickearMunicipio:    Funcion<number, void>[] = [];
    private callbackAlClickearSeccion:      Funcion<number, void>[] = [];
    private callbackAlCambiarCapa:          Funcion<string, void>[] = [];

    constructor(private tagSelect: HTMLSelectElement) {}

    async inicializar() {
        // Esperar que se descarguen los datos para el mapa
        const zonas = await descargarZonas([
            '../data/vector_data/bsas_provincia_distritos.geojson',
            '../data/vector_data/bsas_provincia_secciones.geojson',
            '../data/vector_data/contorno_relleno.geojson'
        ]);

        quitarDialogoCarga()
        mostrarMapa()

        this.mapa = new Mapa(
            document.querySelector("#map"),
            document.querySelector("#idSecciones"),
            zonas[2],
            [
                { nombre: 'municipios', zonas: zonas[0] },
                { nombre: 'secciones', zonas: zonas[1] }
            ]
        );

        this.mapa.setEstado({ capas: ['municipios'] });

        // Inicializar select
        this.nombresMunicipios = this.formatearNombres(
            zonas[0],
            z => z.get('nombreDistrito')
        )

        this.nombresSecciones = this.formatearNombres(
            zonas[1],
            z => z.get('nombreSeccion')
        )

        this.mapa.alEnfocar(estado => {
            for (let f of this.callbackAlEnfocar) {
                f(estado)
            }
        })

        this.mapa.alClickearCualquierDistrito(id => {
            for (let f of this.callbackAlClickearMunicipio) {
                f(id)
            }
        })

        this.mapa.alClickearCualquierSeccion(id => {
            for (let f of this.callbackAlClickearSeccion) {
                f(id)
            }
        })
    }

    municipios() {
        this.mapa.setEstado({
            capas: ['municipios'],
            clickHabilitado: true,
            estilos: this.estiloMunicipios,
            enfoque: [],
            pines: [],
            visibilidad: {}
        })
        for (let f of this.callbackAlCambiarCapa) {
            f('municipios')
        }
    }

    secciones() {
        this.mapa.setEstado({
            capas: ['secciones'],
            clickHabilitado: true,
            estilos: [],
            enfoque: [],
            pines: [],
            visibilidad: {}
        });
        for (let f of this.callbackAlCambiarCapa) {
            f('secciones')
        }
    }

    estaEnSecciones() {
        return this.mapa.nombreCapaActual === 'secciones'
    }

    estaEnMunicipios() {
        return this.mapa.nombreCapaActual === 'municipios'
    }

    hayAlgunaZonaEnfocada() {
        return this.mapa.estado.enfoque.length > 0
    }

    mostrarSoloZona(ids: number[]) {
        this.mapa.setEstado({ enfoque: ids, visibilidad: { zonasVisibles: ids } })
    }

    enfocarProvincia() {
        this.mapa.setEstado({ enfoque: [] });
    }

    enfocarMunicipiosDeSeccion(id: number) {
        const distritosDeSeccion = DistritosPorIdSeccion[id];

        this.mapa.setEstado({
            capas: ['municipios'],
            enfoque: distritosDeSeccion,
            visibilidad: { zonasVisibles: distritosDeSeccion }
        })
    }

    pintarMunicipios(estilos: EstiloZona[]) {
        this.estiloMunicipios = estilos;
        this.mapa.setEstado({
            capas: ['municipios'],
            estilos: this.estiloMunicipios
        })
    }

    alClickearMunicipio(callback: Funcion<number, void>) {
        this.callbackAlClickearMunicipio.push(callback)
    }

    alClickearSeccion(callback: Funcion<number, void>) {
        this.callbackAlClickearSeccion.push(callback)
    }

    alEnfocar(callback: Funcion<Estado, void>) {
        this.callbackAlEnfocar.push(callback)
    }

    alCambiarCapa(callback: Funcion<string, void>) {
        this.callbackAlCambiarCapa.push(callback)
    }

    alternarVisibilidadDeCalles(mostrar: boolean) {
        if (mostrar) {
            this.mapa.mostrarCallesEnZonaEnfocada()
        } else {
            this.mapa.ocultarCallesEnZonaEnfocada()
        }
    }

    restaurarEstado(estado: Estado, emitirEventos = true) {
        this.mapa.setEstado(estado, emitirEventos)
    }

    obtenerNombresDeZonas(capa: 'secciones' | 'municipios'): { nombre: string, valor: number }[] {
        switch (capa) {
            case 'secciones':
                return this.nombresSecciones
            case 'municipios':
                return this.nombresMunicipios
        }
    }

    obtenerCapaActual() {
        return this.mapa.nombreCapaActual
    }

    private formatearNombres(zonas: any[], f: (a: any) => string) {
        return zonas
            .map(z => ({ valor: Number(z.get('id')), nombre: aTitulo(f(z)) }))
    }

    private listarOpcionesEnSelect(nombres: { id: number, nombre: string }[]) {
        const opciones = nombres
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map(data => this.crearOptionTag(data.nombre, data.id))


        while (this.tagSelect.firstChild) {
            this.tagSelect.removeChild(this.tagSelect.firstChild)
        }
        for (let opcion of opciones) {
            this.tagSelect.appendChild(opcion)
        }
        this.tagSelect.prepend(this.crearOptionTag('Todo', -1))
    }

    private crearOptionTag(nombre: string, valor: number) {
        const opt = document.createElement('option')
        opt.value = String(valor),
            opt.appendChild(document.createTextNode(nombre))
        return opt
    }
}