import { Feature, Map, MapBrowserEvent, View } from 'ol'
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM'
import FullScreenControl from 'ol/control/FullScreen'
import TileLayer from 'ol/layer/Tile'
import { getLayer } from '../util/getLayer';
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
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

const extentBuenosAires = [ ...fromLonLat([-64, -42]), ...fromLonLat([-56, -32]) ] as Extent

export class Mapa {

    private map: Map;

    // Capas del mapa
    private openStreetMap: TileLayer;
    private todosLosDistritos: VectorLayer;
    private secciones: VectorLayer;
    private distritosEnfocados: VectorLayer;
    private entornoBsAs: VectorLayer;

    private elementoResaltado: FeatureLike = null;
    private elementoSeleccionado: FeatureLike = null;

    private _nivel: Nivel = Nivel.TODAS_LAS_SECCIONES;
    get nivel(): Nivel { return this._nivel }

    private callbackAlClickearCualquierDistrito: Funcion<number, void>;
    private callbackAlEnfocar: Funcion<{ nivel: Nivel, id: number }, void>;

    constructor(private contenedor: HTMLElement) {}
    
    async iniciarlizar() {
        // Cargar mapa de OpenStreetMap
        this.openStreetMap = new TileLayer({
            source: new OSM({ attributions: [] })
        })

        // Cargar secciones, distritos y entorno
        const [distritos, secciones, entornoBsAs] = await Promise.all([this.capaDistritos(), this.capaSecciones(), this.capaEntornoBsAs()])
        this.todosLosDistritos = distritos;
        this.secciones = secciones;
        this.entornoBsAs = entornoBsAs;
        this.distritosEnfocados = new VectorLayer({ source: new VectorSource() });

        // Establecer visibilidad
        this.openStreetMap.setVisible(false)
        this.todosLosDistritos.setVisible(false)
        this.secciones.setVisible(true)
        this.entornoBsAs.setVisible(true)

        // Establecer estilos 
        const capas = [this.openStreetMap, this.todosLosDistritos, this.distritosEnfocados, this.secciones, this.entornoBsAs]
        for (let capa of capas) {
            if (capa !== this.openStreetMap && capa !== this.entornoBsAs) {
                (capa as VectorLayer).setStyle(Estilos.POR_DEFECTO)
            }
            if (capa == this.entornoBsAs) {
                this.entornoBsAs.setStyle(Estilos.ENTORNO)
            }
        }

        // Mostrar mapa
        this.map = new Map({
            target: this.contenedor,
            layers: [this.openStreetMap, this.todosLosDistritos, this.distritosEnfocados, this.secciones, this.entornoBsAs],
            view: new View({
                center: fromLonLat([-60, -37.3]),
                zoom: 0,
                extent: extentBuenosAires
            }),
            controls: [new FullScreenControl()]
        });

        this.map.on('pointermove', (e) => this.alMoverMouse(e))
        this.map.on('click', (e) => this.alHacerClick(e))

        this.listarOpcionesEnSelect(
            this.secciones.getSource().getFeatures(),
            seccionToNombre
        )
    }

    /**
     * Crea y configura la capa de distritos
     */
    private capaDistritos(): Promise<VectorLayer> {
        return getLayer('../data/vector_data/bsas_provincia_distritos.geojson')
    }

    /**
     * Crea y configura la capa de secciones
     */
    private capaSecciones(): Promise<VectorLayer> {
        return getLayer('../data/vector_data/bsas_provincia_secciones.geojson')
    }

    /**
     * Crea y configura la capa con el entorno de Buenos Aires
     */
    private capaEntornoBsAs(): Promise<VectorLayer> {
        return getLayer('../data/vector_data/contorno_relleno.geojson')
    }

    alMoverMouse(evento: MapBrowserEvent) {
        if (this.elementoResaltado !== null) {
            (this.elementoResaltado as Feature).setStyle(undefined)
            this.elementoResaltado = null;
        }

        this.map.forEachFeatureAtPixel(evento.pixel, feature => {
            //if agregado para evitar click sobre el entorno -- REEMPLAZAR cuando haya tiempo
            if (feature.get('id') != '99999') {
                this.elementoResaltado = feature;
                (this.elementoResaltado as Feature).setStyle(Estilos.RESALTADO)
                return true;
            }
        })
    }

    alHacerClick(evento: MapBrowserEvent) {
        this.map.forEachFeatureAtPixel(evento.pixel, feature => {
            //if agregado para evitar click sobre el entorno -- REEMPLAZAR cuando haya tiempo
            if (feature.get('id') != '99999') {
                if (feature.get('nombreSeccion')) {
                    this.alClickearSeccion(feature as Feature)
                } else {
                    this.alClickearDistrito(feature as Feature)
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

    mostrarCalles() {
        this.openStreetMap.setVisible(true)
    }

    ocultarCalles() {
        this.openStreetMap.setVisible(false)
    }

    mostrarDistritos() {
        this.todosLosDistritos.setVisible(true)
    }

    ocultarDistritos() {
        this.todosLosDistritos.setVisible(false)
    }

    ocultarDistritosEnfocados() {
        this.distritosEnfocados.setVisible(false)
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

    enfocarDistritos() {
        this._nivel = Nivel.TODOS_LOS_DISTRITOS
        this.llamarCallbackEnfocar(this._nivel, null)

        this.ocultarSecciones()
        this.ocultarDistritosEnfocados()
        this.mostrarDistritos()
        this.enfocarBuenosAires()

        this.listarOpcionesEnSelect(
            this.todosLosDistritos.getSource().getFeatures(),
            distritoToNombre
        )
    }

    enfocarSecciones() {
        this._nivel = Nivel.TODAS_LAS_SECCIONES
        this.llamarCallbackEnfocar(this._nivel, null)

        this.ocultarDistritos()
        this.ocultarDistritosEnfocados()
        this.mostrarSecciones()
        this.enfocarBuenosAires()

        this.listarOpcionesEnSelect(
            this.secciones.getSource().getFeatures(),
            seccionToNombre
        )
    }

    enfocarBuenosAires() {
        this.map.getView().fit(extentBuenosAires)
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

    pintarDistritoPorID(id: number, relleno?: string, borde?: string) {
        const distrito = this.todosLosDistritos
            .getSource()
            .getFeatures()
            .find(d => d.get('id') === id)
    
        const estilo = {}

        if (relleno) {
            estilo['fill'] = new Fill({ color: relleno })
        }

        if (borde) {
            estilo['stroke'] = new Stroke({ color: borde })
        }

        if (distrito) {
            distrito.setStyle(new Style(estilo))
        } else {
            throw new Error(`No hay distrito con id = ${id}`)
        }
    }

    private enfocarDistrito(distrito: Feature) {
        this._nivel = Nivel.UN_DISTRITO
        this.llamarCallbackEnfocar(this._nivel, distrito.get('id'))

        this.enfocarFeature(distrito)

        this.ocultarSecciones()
        this.distritosEnfocados.getSource().clear()
        this.distritosEnfocados.getSource().addFeatures([distrito])
        this.distritosEnfocados.setVisible(true)
    }

    private enfocarSeccion(seccion: Feature) {
        this._nivel = Nivel.UNA_SECCION
        this.llamarCallbackEnfocar(this._nivel, seccion.get('id'))

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

        this.distritosEnfocados.getSource().clear()
        this.distritosEnfocados.getSource().addFeatures(distritosQueEnfocar)
        this.distritosEnfocados.setVisible(true)

        this.listarOpcionesEnSelect(
            distritosQueEnfocar,
            distritoToNombre
        )
    }

    private listarOpcionesEnSelect(features: Feature[], extraerNombre: Funcion<Feature, string>) {
        const opciones = features
            .map(feature => ({ nombre: extraerNombre(feature), valor: feature.get('id') }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map(data => this.crearOptionTag(data.nombre, data.valor))
        
        const select = document.querySelector('#idSecciones')
        while (select.firstChild) {
            select.removeChild(select.firstChild)
        }
        for (let opcion of opciones) {
            select.appendChild(opcion)
        }
        select.prepend(this.crearOptionTag('Todo', -1))
    }

    private crearOptionTag(nombre: string, valor: number) {
        const opt = document.createElement('option')
        opt.value = String(valor),
        opt.appendChild(document.createTextNode(nombre))
        return opt
    }

    private mostrarDistritoEnSelect(id: number) {
        this.listarOpcionesEnSelect(
            this.todosLosDistritos.getSource().getFeatures(),
            distritoToNombre
        )
        const select: HTMLSelectElement = document.querySelector('#idSecciones')
        select.value = String(id)
    }

    alClickerUnDistrito(id: number, callback) {
        throw new Error(`Aun no esta implementado!`)
    }

    alClickearCualquierDistrito(callback: Funcion<number, void>) {
        this.callbackAlClickearCualquierDistrito = callback
    }

alEnfocar(callback: Funcion<{ nivel: Nivel, id: number }, void>) {
        this.callbackAlEnfocar = callback;
    }

    private llamarCallbackEnfocar(nivel: Nivel, id: number) {
        if (this.callbackAlEnfocar) {
            this.callbackAlEnfocar({nivel, id});
        }
    }
}