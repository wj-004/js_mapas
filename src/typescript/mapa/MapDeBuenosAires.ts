import { fromLonLat } from "ol/proj";
import { mostrarMapa } from "../app/interfaz/mostrarMapa";
import { quitarDialogoCarga } from "../app/interfaz/quitarDialogoCarga";
import { DistritosPorIdSeccion } from "../data/DistritosPorSeccion";
import { aTitulo } from "../util/aTitulo";
import { descargarZonas } from "../util/descargarZona";
import { Funcion } from "../util/Funcion";
import { Interfaz } from "./interfaz/Interfaz";
import { Estado, EstiloZona, Mapa, Pin } from "./Mapa";
import { DisplayReferencias, Referencia } from "./Referencias";

export class MapaDeBuenosAires {

    mapa: Mapa

    private estiloMunicipios: EstiloZona[] = []
    private pines:  Pin[] = [];

    private nombresMunicipios: { valor: number, nombre: string }[] = []
    private nombresSecciones: { valor: number, nombre: string }[] = []

    private callbackAlEnfocar:              Funcion<Estado, void>[] = [];
    private callbackAlClickearMunicipio:    Funcion<number, void>[] = [];
    private callbackAlClickearSeccion:      Funcion<number, void>[] = [];
    private callbackAlCambiarCapa:          Funcion<string, void>[] = [];

    private referenciasDeSecciones:     Referencia[] = []
    private referenciasDeMunicipios:    Referencia[] = []

    private displayReferencias: DisplayReferencias;

    private _interfaz: Interfaz
    get interfaz() { return this._interfaz }

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

        this.displayReferencias = new DisplayReferencias(document.querySelector('.referencias'))

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

        this.mapa.alCambiarCapa((anterior, actual) => {
            if (actual === 'municipios') {
                this.displayReferencias.referencias = this.referenciasDeMunicipios
            } else {
                this.displayReferencias.referencias = this.referenciasDeSecciones
            }
        })

        this._interfaz = new Interfaz(this)
    }

    municipios() {
        this.mapa.setEstado({
            capas: ['municipios'],
            clickHabilitado: true,
            estilos: this.estiloMunicipios,
            enfoque: [],
            pines: this.pines,
            visibilidad: {},
            centro: null,
            zoom: null
        })
        this.displayReferencias.referencias = this.referenciasDeMunicipios
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
            pines: this.pines,
            visibilidad: {},
            centro: null,
            zoom: null
        });
        this.displayReferencias.referencias = this.referenciasDeSecciones
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
        this.mapa.setEstado({ enfoque: [], centro: null, zoom: null });
    }

    enfocarMunicipiosDeSeccion(id: number) {
        const distritosDeSeccion = DistritosPorIdSeccion[id];

        this.mapa.setEstado({
            capas: ['municipios'],
            enfoque: distritosDeSeccion,
            visibilidad: { zonasVisibles: distritosDeSeccion },
            estilos: this.estiloMunicipios,
            pines: this.pines,
            centro: null,
            zoom: null
        })
    }

    pintarMunicipios(estilos: EstiloZona[]) {
        this.estiloMunicipios = estilos;
        this.mapa.setEstado({
            capas: ['municipios'],
            estilos: this.estiloMunicipios,
        })
    }

    quitarEstilos() {
        this.estiloMunicipios = [];
        this.mapa.setEstado({ estilos: [] })
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

        const referenciasSeccionesMaybe = localStorage.getItem('ReferenciasSecciones')
        if (referenciasSeccionesMaybe) {
            this.referenciasDeSecciones = JSON.parse(referenciasSeccionesMaybe)
        }

        const referenciasMunicipiosMaybe = localStorage.getItem('ReferenciasMunicipios')
        if (referenciasMunicipiosMaybe) {
            this.referenciasDeMunicipios = JSON.parse(referenciasMunicipiosMaybe)
        }

        if (this.mapa.nombreCapaActual === 'municipios') {
            this.displayReferencias.referencias = this.referenciasDeMunicipios
        } else {
            this.displayReferencias.referencias = this.referenciasDeSecciones
        }
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

    agregarPines(pines: Pin[]) {
        this.pines = pines
        this.mapa.setEstado({ pines })
    }

    quitarPines() {
        this.pines = []
        this.mapa.setEstado({ pines: this.pines })
    }

    agregarReferencias(
        referencias: { nombre: string, relleno?: string, borde?: string }[],
        capa: 'municipios' | 'secciones'
    ) 
    {
        if (capa == 'municipios') {
            this.referenciasDeMunicipios = referencias;
            localStorage.setItem('ReferenciasMunicipios', JSON.stringify(referencias));
        } else {
            this.referenciasDeSecciones = referencias;
            localStorage.setItem('ReferenciasSecciones', JSON.stringify(referencias));
        }

        this.displayReferencias.referencias = this.mapa.nombreCapaActual === 'municipios'
            ? this.referenciasDeMunicipios
            : this.referenciasDeSecciones
    }

    quitarReferencias() {
        this.referenciasDeMunicipios = [];
        this.referenciasDeSecciones = [];
        localStorage.removeItem('ReferenciasMunicipios')
        localStorage.removeItem('ReferenciasSecciones')
        this.displayReferencias.referencias = []
    }

    enfocarPunto(punto: { latitud: number, longitud: number }) {
        this.mapa.setEstado({
            centro: fromLonLat([ punto.longitud, punto.latitud ]),
            zoom: 17
        })
    }

    private formatearNombres(zonas: any[], f: (a: any) => string) {
        return zonas
            .map(z => ({ valor: Number(z.get('id')), nombre: aTitulo(f(z)) }))
    }
}