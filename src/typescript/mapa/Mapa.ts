import { Feature, Map, MapBrowserEvent, View } from 'ol'
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM'
import FullScreenControl from 'ol/control/FullScreen'
import TileLayer from 'ol/layer/Tile'
import { seccionToNombre } from '../util/seccionToNombre';
import { distritoToNombre } from '../util/distritoToNombre';
import { Funcion } from '../util/Funcion';
import * as Estilos from './Estilos'
import VectorLayer from 'ol/layer/Vector';
import { FeatureLike } from 'ol/Feature';
import { DistritosPorIdSeccion } from '../data/DistritosPorSeccion'
import { Extent } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import { Nivel } from './Nivel'
import { Style, Icon } from 'ol/style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { resaltar } from './estilo/resaltar';
import { hexToColor } from './estilo/hexToColor';
import { aTitulo } from '../util/aTitulo';
import Point from 'ol/geom/Point';
import { getPinPath } from '../util/getPinPath';
import * as Interacciones from 'ol/interaction';
import * as Control from 'ol/control';
import GeometryType from 'ol/geom/GeometryType';
import { Coordinate } from 'ol/coordinate';
import GeometryCollection from 'ol/geom/GeometryCollection';
import Geometry from 'ol/geom/Geometry';
import { GeoJSON } from 'ol/format'

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
    pines: string[],

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
     * Indica los IDs de las zonas ocultas. Si una zona esta oculta no se la
     * dibuja en el mapa. Las zonas son visibles por defecto.
     */
    zonasOcultas: VisibilidadZona[]
}

type EstiloZona = { id: number, relleno?: string, borde?: string, bordeGrueso?: boolean }
type VisibilidadZona = { id: number, visible: boolean }

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
    estado: Estado = { capas: [], pines: [], enfoque: [], estilos: [], zonasOcultas: [] }
    historialDeEstado: Estado[] = [];

    /**
     * Capa del mapa que se tendra en cuenta a la hora de enfocar zonas
     */
    nombreCapaActual: string
    get capaActual(): VectorLayer {
        return this.capas[this.nombreCapaActual] as VectorLayer;
    }
    private capas: { [nombre: string]: TileLayer | VectorLayer } = {}

    // Capas del mapa
    private openStreetMap: TileLayer; // Se podria hacer un getter privado para esta capa y otras

    private zonaEnfocada: VectorLayer;      
    private iconos: VectorLayer;

    private todosLosDistritos: VectorLayer; // OBSOLETA
    private secciones: VectorLayer;         // OBSOLETA
    private todosLosIconos: VectorLayer;    // OBSOLETA
    private distritoEnfocado: Feature;      // OBSOLETA

    private elementoResaltado: FeatureLike = null;

    private _nivel: Nivel = Nivel.TODOS_LOS_DISTRITOS;
    get nivel(): Nivel { return this._nivel }

    private entornoBsAs: VectorLayer;

    private callbackAlClickearCualquierDistrito: Funcion<number, void>;
    private callbackAlEnfocar: Funcion<Estado, void>;

    private estilosPersonalizados: {
        [ nombreCapa: string ]: { [id: number]: Style },
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

        this.entornoBsAs = new VectorLayer({ source: new VectorSource({
            features: zonaEntornoBsAs, format: new GeoJSON()
        }) })
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
        this.estado = { ...this.estado, ...estado }
        this.establecerCapasVisibles(this.estado.capas);
        this.enfocarZona(this.estado.enfoque);
        this.pintarZonas(this.estado.estilos);
        // this.mostrarPines(this.estado.capas);
        // this.ocultarZona(this.estado.zonasOcultas);

        if (emitirEventos && this.estado.enfoque.length > 0) {
            this.llamarCallbackEnfocar();
        }
    }

    /**
     * Toma una lista de capas y hace que solo esas sean visibles.
     * 
     * @param nombresDeCapas lista de capas que deben hacerse/permanecer visibles
     */
    private establecerCapasVisibles(nombresDeCapas: string[]) {
        this.map.getLayers().clear()
        this.map.getLayers().push(this.entornoBsAs)

        for (let nombre of nombresDeCapas) {
            const capa = nombre == CAPA_OPEN_STREET_MAP
                ? new TileLayer({ source: new OSM({ attributions: [] }) })
                : this.capasDisponibles[nombre]();
            if (capa instanceof VectorLayer) {
                capa.setStyle(Estilos.POR_DEFECTO)
            }
            this.estilosPersonalizados[nombre] = {}
            this.map.getLayers().push(capa)
            this.capas[nombre] = capa
        }

        this.nombreCapaActual = nombresDeCapas[nombresDeCapas.length - 1]
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
            throw new Error(`No hay zona con id = ${id} en la capa ${ this.nombreCapaActual }`)
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
        this.map.forEachFeatureAtPixel(evento.pixel, seccionOdistrito => {
            console.log(seccionOdistrito.get('id'))
            // If agregado para ignorar clicks sobre el entorno -- QUITAR luego de aplicar mascara
            if (seccionOdistrito.get('id') != 99999) {
                // Detectar si se hizo click en una seccion o en un distrito
                if (seccionOdistrito.get('nombreSeccion')) {
                    this.alClickearSeccion(seccionOdistrito as Feature)
                } else {
                    // PARCHE: evitar clicks a otros distritos cuando ya hay uno enfocado
                    if (this.nivel !== Nivel.UN_DISTRITO) {
                        this.alClickearDistrito(seccionOdistrito as Feature)
                    }
                }
            }
        })
    }

    private alClickearSeccion(seccion: Feature) {
        this._nivel = Nivel.UNA_SECCION
        this.enfocarSeccion(seccion)
    }

    private enfocarFeature(feature: Feature) {
        this.map.getView().fit(feature.getGeometry().getExtent())
    }

    private alClickearDistrito(distrito: Feature) {
        this._nivel = Nivel.UN_DISTRITO
        this.ocultarDistritos()
        this.enfocarDistrito(distrito)
        if (this.callbackAlClickearCualquierDistrito) {
            this.callbackAlClickearCualquierDistrito(distrito.get('id'))
        }
    }

    // /**
    //  * Muestra las calles del distrito enfocado unicamente
    //  */
    // mostrarCallesEnZonaEnfocada() {
    //     this.openStreetMap.setVisible(true)

    //     const elResto = this.todosLosDistritos.getSource()
    //         .getFeatures()
    //         .filter(f => f.get('id') !== this.distritoEnfocado.get('id'))
    //         .map(z => Number(z.get('id')));

    //     this.zonaEnfocada.getSource().clear()
    //     this.zonaEnfocada.getSource().addFeatures(elResto)

    //     this.map.getView().fit(this.distritoEnfocado.getGeometry().getExtent())
    // }

    ocultarCalles() {
        this.openStreetMap.setVisible(false)

        this.zonaEnfocada.getSource().clear()
        this.zonaEnfocada.getSource().addFeature(this.distritoEnfocado)

        this.map.getView().fit(this.distritoEnfocado.getGeometry().getExtent())
    }

    /**
     * PARCHE: Esto solo pone a open street map en visible = false.
     * 
     * Es un workaround porque no se puede usar el metodo ocultarCalles, ya que el mismo ahora
     * hace MAS que solo ocultarlas...
     */
    soloOcultarCapaOpenStreetMap() {
        this.openStreetMap.setVisible(false)
    }

    mostrarDistritos() {
        this.todosLosDistritos.setVisible(true)
    }

    ocultarDistritos() {
        this.todosLosDistritos.setVisible(false)
    }

    ocultarDistritosEnfocados() {
        this.zonaEnfocada.setVisible(false)
    }

    mostrarSecciones() {
        this.secciones.setVisible(true)
    }

    ocultarSecciones() {
        this.secciones.setVisible(false)
    }

    mostrarEntornoBsAs() {
        this.entornoBsAs.setVisible(true)
    }

    mostrarIconosEnMapa() {
        this.todosLosIconos.setVisible(true)
    }

    ocultarIconosEnMapa() {
        this.todosLosIconos.setVisible(false)
    }

    enfocarDistritos() {
        this._nivel = Nivel.TODOS_LOS_DISTRITOS

        this.openStreetMap.setVisible(false)

        // Mostrar TODOS los pines que haya
        this.todosLosIconos.setVisible(true)
        this.iconos.setVisible(false)

        this.ocultarSecciones()
        this.ocultarDistritosEnfocados()
        this.mostrarDistritos()
        this.enfocarBuenosAires()

        this.listarOpcionesEnSelect(
            this.todosLosDistritos.getSource().getFeatures(),
            distritoToNombre
        )

        this.tagSelect.value = OPCION_TODOS
        this.establecerInteraccion(Interacciones.MouseWheelZoom, true)
        this.establecerInteraccion(Interacciones.DragPan, true)
    }

    enfocarSecciones() {
        this._nivel = Nivel.TODAS_LAS_SECCIONES

        this.openStreetMap.setVisible(false)

        // Mostrar TODOS los pines que haya
        this.todosLosIconos.setVisible(true)
        this.iconos.setVisible(false)

        this.ocultarDistritos()
        this.ocultarDistritosEnfocados()
        this.mostrarSecciones()
        this.enfocarBuenosAires()

        this.listarOpcionesEnSelect(
            this.secciones.getSource().getFeatures(),
            seccionToNombre
        )

        this.tagSelect.value = OPCION_TODOS;
    }

    enfocarBuenosAires() {
        this.map.getView().fit(extentBuenosAires)
        this.establecerInteraccion(Interacciones.DragPan, false)
    }

    ponerNivelEnTodosLosDistritos() {
        this._nivel = Nivel.TODOS_LOS_DISTRITOS
    }

    enfocarSeccionPorId(id: number) {
        const seccion = this.secciones
            .getSource()
            .getFeatures()
            .find(s => s.get('id') === id)

        if (seccion) {
            this.enfocarSeccion(seccion)
        } else {
            throw new Error(`No hay seccion con id = ${id}`)
        }
    }

    enfocarDistritoPorId(id: number) {
        const distrito = this.todosLosDistritos
            .getSource()
            .getFeatures()
            .find(d => d.get('id') === id)

        if (distrito) {
            this.ocultarDistritos()
            this.enfocarDistrito(distrito)
            this.mostrarDistritoEnSelect(id)
            if (this.callbackAlClickearCualquierDistrito) {
                this.callbackAlClickearCualquierDistrito(id)
            }
        } else {
            throw new Error(`No hay distrito con id = ${id}`)
        }
    }

    enfocarFeatureEnNivel(id: number, nivel: Nivel) {
        switch (nivel) {
            case Nivel.UNA_SECCION:
                this.enfocarSeccionPorId(id)
                break
            case Nivel.UN_DISTRITO:
                this.enfocarDistritoPorId(id)
                break
            default:
                break;
        }
    }

    pintarDistritoPorID(id: number, relleno?: string, borde?: string, bordeGrueso?: boolean) {
        const distrito = this.todosLosDistritos
            .getSource()
            .getFeatures()
            .find(d => d.get('id') === id)

        const estilo = id in this.estilosPersonalizados.distritos
            ? this.estilosPersonalizados.distritos[id].clone()
            : Estilos.POR_DEFECTO.clone()

        if (!!relleno) {
            estilo.setFill(new Fill({ color: hexToColor(relleno) }))
        }


        const ancho = !!bordeGrueso
            ? 4
            : 2

        if (!!borde) {
            estilo.setStroke(new Stroke({ color: hexToColor(borde), width: ancho }));
        } else {
            estilo.setStroke(new Stroke({
                color: Estilos.POR_DEFECTO.getFill().getColor(), width: ancho
            }))
        }

        if (distrito && (!!relleno || !!borde)) {
            distrito.setStyle(estilo)
            this.estilosPersonalizados.distritos[id] = estilo
        } else {
            throw new Error(`No hay distrito con id = ${id}`)
        }
    }

    pintarSeccionPorID(id: number, relleno?: string, borde?: string) {
        const seccion = this.secciones
            .getSource()
            .getFeatures()
            .find(d => d.get('id') === id)

        const estilo = Estilos.POR_DEFECTO.clone();

        if (relleno) {
            estilo.setFill(new Fill({ color: hexToColor(relleno) }))
        }

        if (borde) {
            estilo.setStroke(new Stroke({ color: hexToColor(borde), width: 2 }))
        } else {
            estilo.setStroke(new Stroke({
                color: Estilos.POR_DEFECTO.getFill().getColor(), width: 2
            }))
        }

        if (seccion) {
            seccion.setStyle(estilo)
            this.estilosPersonalizados.distritos[id] = estilo
        } else {
            throw new Error(`No hay seccion con id = ${id}`)
        }
    }

    /**
     * Restablece el estilo de todos los distritos al valor por defecto
     */
    restablecerEstiloDeDistritos() {
        for (let distrito of this.todosLosDistritos.getSource().getFeatures()) {
            distrito.setStyle(Estilos.POR_DEFECTO);
        }
        this.estilosPersonalizados = { ...this.estilosPersonalizados, distritos: {} };
    }

    private enfocarDistrito(distrito: Feature) {
        this._nivel = Nivel.UN_DISTRITO

        this.enfocarFeature(distrito)

        this.distritoEnfocado = distrito
        this.ocultarSecciones()
        this.zonaEnfocada.getSource().clear()
        this.zonaEnfocada.getSource().addFeatures([distrito])
        this.zonaEnfocada.setVisible(true)
        this.soloMostrarPinesDeZona([distrito]);

        this.tagSelect.value = String(distrito.get('id'))
        this.establecerInteraccion(Interacciones.MouseWheelZoom, true)
        this.establecerInteraccion(Interacciones.DragPan, true)
    }

    private enfocarSeccion(seccion: Feature) {
        this._nivel = Nivel.UNA_SECCION

        this.enfocarFeature(seccion)
        const seccionId: number = seccion.get('id');

        this.secciones.setVisible(false)
        this.todosLosDistritos.setVisible(false)

        // Mostrar (solo?) los distritos de la seccion
        const idDistritos: number[] = DistritosPorIdSeccion[seccionId]
        const distritosQueEnfocar = this.todosLosDistritos
            .getSource()
            .getFeatures()
            .filter(feature => idDistritos.includes(feature.get('id')))

        this.zonaEnfocada.getSource().clear()
        this.zonaEnfocada.getSource().addFeatures(distritosQueEnfocar)
        this.zonaEnfocada.setVisible(true)

        this.soloMostrarPinesDeZona(distritosQueEnfocar)

        this.listarOpcionesEnSelect(
            distritosQueEnfocar,
            distritoToNombre
        )

        this.tagSelect.value = OPCION_TODOS;
        this.establecerInteraccion(Interacciones.MouseWheelZoom, true)
        this.establecerInteraccion(Interacciones.DragPan, true)
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

    private mostrarDistritoEnSelect(id: number) {
        this.listarOpcionesEnSelect(
            this.todosLosDistritos.getSource().getFeatures(),
            distritoToNombre
        )

        this.tagSelect.value = String(id)
    }

    alClickerUnDistrito(id: number, callback) {
        throw new Error(`Aun no esta implementado!`)
    }

    alClickearCualquierDistrito(callback: Funcion<number, void>) {
        this.callbackAlClickearCualquierDistrito = callback
    }

    alEnfocar(callback: Funcion<Estado, void>) {
        this.callbackAlEnfocar = callback;
    }

    private llamarCallbackEnfocar() {
        if (this.callbackAlEnfocar) {
            this.callbackAlEnfocar(this.estado);
        }
    }

    //INICIO DE MANEJO DE ICONOS - MODIFICAR
    public deleteIconFeatures() {
        if (!!this.todosLosIconos && !!this.todosLosIconos.getSource()) {
            const iconos = this.todosLosIconos.getSource();
            iconos.getFeatures().forEach(function (feature) {
                if (feature.getGeometry().getType() === 'Point') {
                    iconos.removeFeature(feature);
                }
            });
        }
    }

    mostrarTodosLosIconos() {
        this.iconos.setVisible(false)
        this.todosLosIconos.setVisible(true)
    }

    /**
     * Muestra SOLO los pines contenidos en una zona particular
     */
    private soloMostrarPinesDeZona(zona: Feature[]) {
        const iconos = this.todosLosIconos
            .getSource().getFeatures()

            // Dejar solo los iconos validos. Por algun motivo hay iconos que tienen una (o dos) coordenadas NaN.
            .filter(i => this.tieneCoordenadasValidas(i))
            
            // Tomar todos los que estan DENTRO de la zona dada
            .filter(i => {
                const coords = (i.getGeometry() as Point).getCoordinates()
                return zona.some(z => this.zonaContieneCoord(z, coords))
            })
        
        this.iconos.getSource().clear();
        this.iconos.getSource().addFeatures(iconos)
        this.todosLosIconos.setVisible(false);
        this.iconos.setVisible(true);
    }

    private tieneCoordenadasValidas(icono: Feature): boolean {
        return icono.getGeometry().getType() === GeometryType.POINT
            && !isNaN((icono.getGeometry() as Point).getCoordinates()[0])
            && !isNaN((icono.getGeometry() as Point).getCoordinates()[1])
    }

    private zonaContieneCoord(zona: Feature, coord: Coordinate): boolean {
        return zona.getGeometry().intersectsCoordinate(coord)
    }

    public mostrarPinesEntidadesJudiciales(nombre, entidad, lonLatAtArray) {
        if (typeof entidad !== 'string') {
            console.debug('addIconToFeature: tipo es distinto de string')
        }
        var iconoPath = "../../../" + getPinPath('TRIBUNALES', entidad);

        this.todosLosIconos.getSource().addFeature(
            this.crearIconFeature(nombre, iconoPath, lonLatAtArray)
        );
        return true;
    }

    public agregarPin(pos: { coords?: Coordinate, longLat?: [number, number] }) {
        if (!pos.coords && !pos.longLat) {
            throw new Error(`El pin no tienen ninguna posicion!! Pasale coords o longLat, cabeza`)
        }

        const position = pos.coords ?? pos.longLat

        const icono = new Feature({geometry: new Point(position)})
        const estilo = new Style({
            image: new Icon({ anchor: [0.5, 1], scale: 0.7, src: "../../../" + getPinPath('TRIBUNALES', "PENAL") })
        })
        icono.setStyle(estilo);

        this.todosLosIconos.getSource().addFeature(icono)
    }

    private crearIconFeature(entityName, Iconopath, latLonAsArray) {
        var iconFeature = new Feature({
            geometry: new Point(fromLonLat(latLonAsArray)),
            name: entityName ?? ''
        });

        try {
            iconFeature.setStyle(new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    src: Iconopath,
                    scale: 0.7,
                })
            }));
        } catch (e) {
            console.error("Error crearIconFeature function: " + e);
        }
        return iconFeature;
    }

    establecerInteraccion(interaccion, habilitar = true) {
        this.map.getInteractions().forEach(function (e) {
            if (e instanceof interaccion) {
                e.setActive(habilitar);
            }
        });
    }
}
