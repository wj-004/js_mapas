import { aTitulo } from '../util/aTitulo';
import { Extent } from 'ol/extent';
import { Feature, Map, MapBrowserEvent, View } from 'ol'
import { FeatureLike } from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { Funcion, Funcion2 } from '../util/Funcion';
import { GeoJSON } from 'ol/format'
import { hexToColor } from './estilo/hexToColor';
import { resaltar } from './estilo/resaltar';
import { seccionToNombre } from '../util/seccionToNombre';
import { Style, Icon } from 'ol/style';
import * as Control from 'ol/control';
import * as Estilos from './Estilos'
import * as Interacciones from 'ol/interaction';
import Fill from 'ol/style/Fill';
import FullScreenControl from 'ol/control/FullScreen'
import Geometry from 'ol/geom/Geometry';
import GeometryCollection from 'ol/geom/GeometryCollection';
import OSM from 'ol/source/OSM'
import Point from 'ol/geom/Point';
import Stroke from 'ol/style/Stroke';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { DistritosPorIdSeccion } from '../data/DistritosPorSeccion';
import { Coordinate } from 'ol/coordinate';

const extentBuenosAires = [...fromLonLat([-64, -42]), ...fromLonLat([-56, -32])] as Extent

/**
 * Describe el estado del mapa, lo que se ve en el.
 */
export type Estado = {
    /**
     * Indica que capas estan visibles. La ultima capa de este arreglo
     * se considera la capa "actual", la capa superior.
     */
    capas: string[],

    /**
     * Indica los pines visibles en el mapa.
     */
    pines: Pin[],

    /**
     * Indica los IDs de las zonas (o zona) enfocadas. Si una zona esta
     * enfocada la vista del mapa esta centrada en ella. Si hay mas de una
     * zona que enfocar la vista del mapa estara en el centro de todas ellas.
     * Si este arreglo esta vacio el mapa se centra sobre la capa actual
     * entera.
     */
    enfoque: number[]

    /**
     * Indica el color de relleno, y el color y ancho del borde de zonas
     * especificas. Cualquier zona que no este aqui tiene el color por
     * defecto.
     */
    estilos: EstiloZona[],

    /**
     * Indica la visiblidad de las zonas. Esta prop debe tener solo una de las
     * dos alternativas: zonasOcultas o zonasVisibles.
     * 
     * zonasVisibles: indica la lista de IDs de las zonas que deben verse, el
     * resto de las zonas son ocultadas.
     * 
     * zonasOcultas: indica la lista de IDs de las zonas que se ocultaran, el
     * resto permanecen visibles.
     * 
     * Si la prop esta vacia, todas las zonas son visibles.
     */
    visibilidad: {
        zonasOcultas?: number[],
        zonasVisibles?: number[],
    }

    /**
     * Indica si el usuario tiene permitido hacer click en una zona. Verdadero por defecto.
     */
    clickHabilitado: boolean
}

export type Pin = { latitud: number, longitud: number, color: string }

export type EstiloZona = { id: number, relleno?: string, borde?: string, bordeGrueso?: boolean }

/**
 * Valor de la opcion "Todos" en el selector de seccion/distrito.
 * 
 * Esto no deberia ir aqui, pero aca se queda. Por ahora.
 */
const OPCION_TODOS = String(-1);

const CAPA_OPEN_STREET_MAP = 'calles';

export class Mapa {

    private map: Map;

    private capasDisponibles: { [nombre: string]: () => VectorLayer | TileLayer } = {}
    estado: Estado = {
        capas: [],
        pines: [],
        enfoque: [],
        estilos: [],
        visibilidad: {},
        clickHabilitado: true
    }
    historialDeEstado: Estado[] = [];

    /**
     * Capa del mapa que se tendra en cuenta a la hora de enfocar zonas
     */
    nombreCapaActual: string
    get capaActual(): VectorLayer {
        return this.capas[this.nombreCapaActual] as VectorLayer;
    }
    private capas: { [nombre: string]: TileLayer | VectorLayer } = {}

    private iconos: VectorLayer;

    private elementoResaltado: FeatureLike = null;

    private entornoBsAs: VectorLayer;

    private callbackClickSeccion: Funcion<number, void>;
    private callbackAlClickearCualquierDistrito: Funcion<number, void>;
    private callbackAlEnfocar: Funcion<Estado, void>;
    private callbackAlCambiarCapa: Funcion2<string, string, void>;

    private estilosPersonalizados: {
        [nombreCapa: string]: { [id: number]: Style },
    } = { distritos: {}, secciones: {} }

    constructor(
        private contenedor: HTMLElement,
        private tagSelect: HTMLSelectElement,
        zonaEntornoBsAs: Feature<Geometry>[],
        capas: { nombre: string, zonas: Feature<Geometry>[] }[],
    ) {
        // Guardar capas
        for (let capa of capas) {
            this.capasDisponibles[capa.nombre] = () => new VectorLayer({
                source: new VectorSource({ features: capa.zonas, format: new GeoJSON() })
            });
        }

        this.capasDisponibles[CAPA_OPEN_STREET_MAP] = () => {
            return new TileLayer({
                source: new OSM({ attributions: [] })
            })
        }

        this.iconos = new VectorLayer({
            source: new VectorSource()
        })

        this.entornoBsAs = new VectorLayer({
            source: new VectorSource({
                features: zonaEntornoBsAs, format: new GeoJSON()
            })
        })
        this.entornoBsAs.setStyle(Estilos.ENTORNO)

        // Mostrar mapa
        this.map = new Map({
            target: this.contenedor,
            layers: [],
            view: new View({
                center: fromLonLat([-60, -37.3]),
                zoom: 0,
                extent: extentBuenosAires
            }),
            controls: Control.defaults({
                attribution: false,
                zoom: false
            }).extend([
                new FullScreenControl()
            ]),
            interactions: Interacciones.defaults({
                dragPan: true,
                altShiftDragRotate: false,
                doubleClickZoom: false,
                mouseWheelZoom: true,
                pinchZoom: false,
                shiftDragZoom: false,
                keyboard: false
            })
        });

        this.establecerInteraccion(Interacciones.DragPan, false)

        // Establecer listeners
        this.map.on('pointermove', (e) => this.alMoverMouse(e))
        this.map.on('click', (e) => this.alHacerClick(e))

        // this.listarOpcionesEnSelect(
        //     this.todosLosDistritos.getSource().getFeatures(),
        //     distritoToNombre
        // )

        this.tagSelect.value = OPCION_TODOS
    }

    /**
     * Establece el estado del mapa. El estado del mapa esta compuesto por:
     *  - Las capas que estan visibles
     *  - Las zonas que estan enfocadas
     *  - Los pines que estan visibles (PENDIENTE)
     *  - Los colores de las zonas de la capa mas superior
     *  - Las referencias de los colores (PENDIENTE)
     * 
     * Este metodo se encarga de setear todo eso de manera incremental. Por eso
     * recibe como parametro un estado parcial, un estado que puede tener todos
     * los atributos mencionados arriba o no. Ese estado parcial se agrega al
     * estado "actual" del mapa, sobreescribiendo los atributos que corresponda.
     * 
     * @param estado nuevo estado del mapa
     * @param emitirEventos bandera que indica si se emitiran o no eventos
     */
    setEstado(estado: Partial<Estado>, emitirEventos = true) {
        this.historialDeEstado.push(this.estado);
        this.estado = this.mutarEstado(this.estado, { ...this.estado, ...estado });
        this.establecerCapasVisibles(this.estado.capas);
        this.enfocarZona(this.estado.enfoque);
        this.pintarZonas(this.estado.estilos);
        this.establecerVisibilidad(this.estado.visibilidad);
        this.mostrarPines(this.estado.pines);

        if (emitirEventos && 'enfoque' in estado) {
            this.llamarCallbackEnfocar();
        }
    }

    private mostrarPines(pines: Pin[]) {
        this.iconos.getSource().clear()
        const iconos = pines
            .map(pin => this.crearPin(pin.latitud, pin.longitud, pin.color))
        this.iconos.getSource().addFeatures(iconos)
    }

    private establecerVisibilidad(visibilidad: { zonasVisibles?: number[], zonasOcultas?: number[] }) {
        if ('zonasVisibles' in visibilidad && 'zonasOcultas' in visibilidad) {
            throw new Error('ERROR: "zonasVisibles" y "zonasOcultas" NO pueden estar en la prop visibilidad a la vez')
        }

        if ('zonasVisibles' in visibilidad) {
            // Ocultar el resto de las zonas para dejar solo las que deben ser visibles
            const elResto = this.zonasMenosIds(visibilidad.zonasVisibles)
                .map(z => Number(z.get('id')))
            this.ocultarZona(elResto);
        }

        if ('zonasOcultas' in visibilidad) {
            this.ocultarZona(visibilidad.zonasOcultas);
        }
    }

    /**
     * Este metodo se encarga de establecer el valor de propiedades del estado que dependen
     * de otras propiedades del estado.
     * @param estadoActual 
     */
    private mutarEstado(estadoActual: Estado, proximoEstado: Estado) {
        /**
         * Cuando hay alguna seccion enfocada el click debe deshabilitarse para impedir
         * que se enfoque otra zona sin antes quitarle el foco a las ya enfocadas.
         */
        const clickHabilitado = !(proximoEstado.enfoque.length === 1)

        // Revisar si se cambiar de la capa "secciones" a la capa "municipios"
        const nombreProximaCapa = proximoEstado.capas[proximoEstado.capas.length - 1]

        let estilos = proximoEstado.estilos;

        if (this.nombreCapaActual !== nombreProximaCapa) {
            if (this.nombreCapaActual === 'secciones' && nombreProximaCapa === 'municipios') {
                estilos = estadoActual.estilos
                    .filter(estilo => proximoEstado.enfoque.includes(estilo.id))
            }
        }

        let pines = proximoEstado.pines

        if (proximoEstado.enfoque.length > 0 && pines.length > 0) {
            let capa = this.nombreCapaActual
            const proximaCapa = proximoEstado.capas[proximoEstado.capas.length - 1]
            if (this.nombreCapaActual === 'secciones' && proximaCapa === 'municipios') {
                capa = 'municipios'
            }
            const zonas = (this.capas[capa] as VectorLayer)
                .getSource()
                .getFeatures()
                .filter(f => proximoEstado.enfoque.includes(Number(f.get('id'))))

            pines = pines
                .filter(
                    pin => zonas.some(z =>
                        this.zonaContieneCoord(z, fromLonLat([pin.longitud, pin.latitud]))
                    )
                )
        }

        return { ...proximoEstado, clickHabilitado, estilos, pines }
    }

    /**
     * Toma una lista de capas y hace que solo esas sean visibles.
     * 
     * @param nombresDeCapas lista de capas que deben hacerse/permanecer visibles
     */
    private establecerCapasVisibles(nombresDeCapas: string[]) {
        this.map.getLayers().clear()

        for (let nombre of nombresDeCapas) {
            const capa = nombre == CAPA_OPEN_STREET_MAP
                ? new TileLayer({ source: new OSM({ attributions: [] }) })
                : this.capasDisponibles[nombre]();
            if (capa instanceof VectorLayer) {
                capa.setStyle(Estilos.POR_DEFECTO)
            }
            if (!(nombre in this.estilosPersonalizados)) {
                this.estilosPersonalizados[nombre] = {}
            }
            this.map.getLayers().push(capa)
            this.capas[nombre] = capa
        }

        this.map.getLayers().push(this.entornoBsAs)
        this.map.getLayers().push(this.iconos)

        const nombreCapaAnterior = this.nombreCapaActual
        this.nombreCapaActual = nombresDeCapas[nombresDeCapas.length - 1]

        if (this.callbackAlCambiarCapa) {
            this.callbackAlCambiarCapa(nombreCapaAnterior, this.nombreCapaActual)
        }
    }

    private enfocarZona(ids: number[]) {
        if (ids.length > 0) {
            const porciones = this.capaActual
                .getSource()
                .getFeatures()
                .filter(z => ids.includes(Number(z.get('id'))))

            const coleccion = new GeometryCollection(porciones.map(z => z.getGeometry()))
            this.map.getView().fit(coleccion.getExtent())
        } else {
            this.map.getView().fit(this.capaActual.getSource().getExtent())
        }
    }

    private ocultarZona(ids: number[]) {
        const zonas = this.capaActual.getSource();
        for (let id of ids) {
            const zona = this.encontrarZona(id);
            zonas.removeFeature(zona);
        }
    }

    private pintarZonas(estilos: EstiloZona[]) {
        for (let estilo of estilos) {
            const style = this.aStyle(estilo);
            const zona = this.encontrarZona(estilo.id);
            if (zona && (!!estilo.relleno || !!estilo.borde)) {
                zona.setStyle(style)
                this.estilosPersonalizados[this.nombreCapaActual][estilo.id] = style
            }
        }
    }

    private getEstilo(id: number, capa: string): Style {
        return id in this.estilosPersonalizados[capa]
            ? this.estilosPersonalizados[capa][id]
            : Estilos.POR_DEFECTO;
    }

    private aStyle(estiloZona: EstiloZona): Style {
        const estilo = this.getEstilo(estiloZona.id, this.nombreCapaActual).clone();

        if (!!estiloZona.relleno) {
            estilo.setFill(new Fill({ color: hexToColor(estiloZona.relleno) }))
        }

        const ancho = !!estiloZona.bordeGrueso ? 4 : 2

        if (!!estiloZona.borde) {
            estilo.setStroke(new Stroke({ color: hexToColor(estiloZona.borde), width: ancho }));
        } else {
            estilo.setStroke(new Stroke({
                color: Estilos.POR_DEFECTO.getFill().getColor(), width: ancho
            }))
        }
        return estilo;
    }

    private encontrarZona(id: number): Feature {
        const zona = this.capaActual
            .getSource()
            .getFeatures()
            .find(d => d.get('id') === id);

        if (zona) {
            return zona
        } else {
            throw new Error(`No hay zona con id = ${id} en la capa ${this.nombreCapaActual}`)
        }
    }

    private alMoverMouse(evento: MapBrowserEvent) {
        this.resaltarZonaBajoMouse(evento)
    }

    private resaltarZonaBajoMouse(evento: MapBrowserEvent) {
        if (this.elementoResaltado !== null) {
            const estiloPersonalizado = this.getEstilo(Number(this.elementoResaltado.get('id')), this.nombreCapaActual)

            if (estiloPersonalizado) {
                (this.elementoResaltado as Feature).setStyle(estiloPersonalizado)
            } else {
                (this.elementoResaltado as Feature).setStyle(undefined)
            }

            this.elementoResaltado = null;
        }

        this.map.forEachFeatureAtPixel(evento.pixel, feature => {
            //if agregado para evitar click sobre el entorno -- REEMPLAZAR por mascara (clipping) cuando haya tiempo
            if (feature.get('id') != '99999' && feature.getGeometry().getType() != 'Point') {
                this.elementoResaltado = feature;

                const id = this.elementoResaltado.get('id');

                const estiloPersonalizado = this.getEstilo(Number(id), this.nombreCapaActual);

                const estilo: Style = !!estiloPersonalizado
                    ? resaltar(estiloPersonalizado)
                    : Estilos.RESALTADO;

                (this.elementoResaltado as Feature).setStyle(estilo)
                return true;
            }
        })
    }

    alHacerClick(evento: MapBrowserEvent) {
        if (this.estado.clickHabilitado) {
            this.map.forEachFeatureAtPixel(evento.pixel, seccionOdistrito => {
                // If agregado para ignorar clicks sobre el entorno -- QUITAR luego de aplicar mascara
                if (seccionOdistrito.get('id') != 99999) {

                    // Detectar si se hizo click en una seccion o en un distrito
                    if (seccionOdistrito.get('nombreSeccion')) {
                        this.alClickearSeccion(seccionOdistrito as Feature)
                    } else {
                        this.alClickearDistrito(seccionOdistrito as Feature)
                    }
                }
            })
        }
    }

    private alClickearSeccion(seccion: Feature) {
        const id = Number(seccion.get('id'));

        const distritosDeSeccion = DistritosPorIdSeccion[id];

        this.setEstado({
            capas: ['municipios'],
            enfoque: distritosDeSeccion,
            visibilidad: { zonasVisibles: distritosDeSeccion }
        })

        if (this.callbackClickSeccion) {
            this.callbackClickSeccion(id)
        }
    }

    private alClickearDistrito(distrito: Feature) {
        const id = Number(distrito.get('id'));

        this.setEstado({ enfoque: [id], visibilidad: { zonasVisibles: [id] } })

        this.llamarCallbackClickEnDistrito(id)
    }

    private zonasMenosIds(ids: number[]) {
        return this.capaActual
            .getSource()
            .getFeatures()
            .filter(f => !ids.includes(f.get('id')))
    }

    /**
     * Muestra las calles de la zona enfocada unicamente
     */
    mostrarCallesEnZonaEnfocada() {
        this.setEstado({
            visibilidad: { zonasOcultas: this.estado.enfoque },
            capas: [CAPA_OPEN_STREET_MAP, this.nombreCapaActual]
        })
    }

    /**
     * Oculta las calles y solo muestra la zona enfocada
     */
    ocultarCallesEnZonaEnfocada() {
        this.setEstado({
            visibilidad: { zonasVisibles: this.estado.enfoque },
            capas: [this.nombreCapaActual]
        })
    }

    enfocarMunicipios() {
        this.setEstado({
            capas: ['municipios'],
            enfoque: [],
            visibilidad: { zonasOcultas: [] }
        })

        // TO DO: Las interacciones deberian ser parte del estado
        this.establecerInteraccion(Interacciones.MouseWheelZoom, true)
        this.establecerInteraccion(Interacciones.DragPan, true)
    }

    enfocarSecciones() {
        this.setEstado({
            capas: ['secciones'],
            enfoque: [],
            visibilidad: { zonasOcultas: [] }
        })

        // TO DO: Las interacciones deberian ser parte del estado
        this.establecerInteraccion(Interacciones.MouseWheelZoom, true)
        this.establecerInteraccion(Interacciones.DragPan, true)

        // TO DO: Esto no deberia ir aqui. En un evento tal vez.
        this.listarOpcionesEnSelect(
            this.capaActual.getSource().getFeatures(),
            seccionToNombre
        )
        this.tagSelect.value = OPCION_TODOS
    }

    private listarOpcionesEnSelect(features: Feature[], extraerNombre: Funcion<Feature, string>) {
        const opciones = features
            .map(feature => ({ nombre: extraerNombre(feature), valor: feature.get('id') }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map(data => this.crearOptionTag(data.nombre, data.valor))


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
            opt.appendChild(document.createTextNode(aTitulo(nombre)))
        return opt
    }

    alClickearCualquierDistrito(callback: Funcion<number, void>) {
        this.callbackAlClickearCualquierDistrito = callback
    }

    alClickearCualquierSeccion(callback: Funcion<number, void>) {
        this.callbackClickSeccion = callback
    }

    alEnfocar(callback: Funcion<Estado, void>) {
        this.callbackAlEnfocar = callback;
    }

    alCambiarCapa(callback: Funcion2<string, string, void>) {
        this.callbackAlCambiarCapa = callback
    }

    private llamarCallbackEnfocar() {
        if (this.callbackAlEnfocar) {
            this.callbackAlEnfocar(this.estado);
        }
    }

    private llamarCallbackClickEnDistrito(id: number) {
        if (this.callbackAlClickearCualquierDistrito) {
            this.callbackAlClickearCualquierDistrito(id);
        }
    }

    private crearPin(latitud: number, longitud: number, color: string) {
        var iconFeature = new Feature({
            geometry: new Point(fromLonLat([longitud, latitud])),
        });

        iconFeature.setStyle(
            new Style({
                image:
                    new Icon({
                        anchor: [0.5, 1],
                        src: "../../../img/pines/judiciales/PIN_GENERICO.png",
                        scale: 0.8,
                        color
                    })
            })
        );

        return iconFeature;
    }

    private zonaContieneCoord(zona: Feature, coord: Coordinate): boolean {
        return zona.getGeometry().intersectsCoordinate(coord)
    }

    establecerInteraccion(interaccion, habilitar = true) {
        this.map.getInteractions().forEach(function (e) {
            if (e instanceof interaccion) {
                e.setActive(habilitar);
            }
        });
    }
}
