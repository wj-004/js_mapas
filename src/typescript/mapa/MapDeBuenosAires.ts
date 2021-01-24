import { mostrarMapa } from "../app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "../app/interfaz/quitarDialogoCarga";
import { DistritosPorIdSeccion } from "../data/DistritosPorSeccion";
import { aTitulo } from "../util/aTitulo";
import { descargarZonas } from "../util/descargarZona";
import { Funcion } from "../util/Funcion";
import { Estado, EstiloZona, Mapa } from "./Mapa";

const OPCION_TODOS = -1

export class MapaDeBuenosAires {

    private mapa: Mapa

    private estiloMunicipios: EstiloZona[] = []

    private nombresMunicipios: { id: number, nombre: string }[] = []
    private nombresSecciones: { id: number, nombre: string }[] = []

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

        this.listarOpcionesEnSelect(this.nombresMunicipios)
        this.tagSelect.value = String(OPCION_TODOS)

        this.mapa.alClickearCualquierSeccion(id => {
            this.tagSelect.value = String(id)
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
        
        // TO DO: Esto no deberia ir aqui. En un evento tal vez.
        this.listarOpcionesEnSelect(this.nombresMunicipios)
        this.tagSelect.value = String(OPCION_TODOS)
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
        this.listarOpcionesEnSelect(this.nombresSecciones)
        this.tagSelect.value = String(OPCION_TODOS)
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

        this.listarOpcionesEnSelect(this.nombresMunicipios)
        this.tagSelect.value = String(OPCION_TODOS)
    }

    pintarMunicipios(estilos: EstiloZona[]) {
        this.estiloMunicipios = estilos;
        this.mapa.setEstado({
            capas: ['municipios'],
            estilos: this.estiloMunicipios
        })
    }

    alClickearMunicipio(callback: Funcion<number, void>) {
        this.mapa.alClickearCualquierDistrito(id => {
            this.tagSelect.value = String(id)
            if (callback) {
                callback(id)
            }
        })
    }

    alEnfocar(callback) {
        this.mapa.alEnfocar(callback)
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

    private formatearNombres(zonas: any[], f: (a: any) => string) {
        return zonas
            .map(z => ({ id: Number(z.get('id')), nombre: f(z) }))
            .map(({id, nombre}) => ({ id, nombre: nombre.split(" ").map(aTitulo).join(" ") }))
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