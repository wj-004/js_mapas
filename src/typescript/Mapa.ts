import { Feature, Map, MapBrowserEvent, View } from 'ol'
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM'
import FullScreenControl from 'ol/control/FullScreen'
import TileLayer from 'ol/layer/Tile'
import { getLayer } from './util/getLayer';
import * as Estilos from './Estilos'
import VectorLayer from 'ol/layer/Vector';
import { FeatureLike } from 'ol/Feature';

export class Mapa {

    private map: Map;

    // Capas del mapa
    private openStreetMap: TileLayer;
    private distritos: VectorLayer;
    private secciones: VectorLayer;

    private elementoResaltado: FeatureLike = null;

    constructor(private contenedor: HTMLElement) {}
    
    async iniciarlizar() {
        // Cargar mapa de OpenStreetMap
        this.openStreetMap = new TileLayer({
            source: new OSM({ attributions: [] })
        })

        // Cargar secciones y distritos
        const [distritos, secciones] = await Promise.all([this.capaDistritos(), this.capaSecciones()])
        this.distritos = distritos;
        this.secciones = secciones;

        // Establecer visibilidad
        this.openStreetMap.setVisible(false)
        this.distritos.setVisible(false)
        this.secciones.setVisible(true)

        // Enfocar Buenos Aires
        const minExtents = fromLonLat([-64, -42])
        const maxExtents = fromLonLat([-56, -32])

        // Mostrar mapa
        this.map = new Map({
            target: this.contenedor,
            layers: [this.openStreetMap, this.distritos, this.secciones],
            view: new View({
                center: fromLonLat([-60, -37.3]),
                zoom: 0,
                extent: [
                    minExtents[0],
                    minExtents[1],
                    maxExtents[0],
                    maxExtents[1]
                ]
            }),
            controls: [new FullScreenControl()]
        });

        this.map.on('pointermove', (e) => this.alMoverMouse(e))
    }

    /**
     * Crea y configura la capa de distritos
     */
    private capaDistritos(): Promise<VectorLayer> {
        return getLayer('data/vector_data/municipios-buenos_aires.geojson')
            .then(distritos => {
                distritos.setStyle(Estilos.POR_DEFECTO)
                return distritos
            })
    }

    /**
     * Crea y configura la capa de secciones
     */
    private capaSecciones(): Promise<VectorLayer> {
        return getLayer('data/vector_data/secciones-buenos_aires.geojson')
            .then(secciones => {
                secciones.setStyle(Estilos.POR_DEFECTO)
                return secciones
            })
    }

    alMoverMouse(evento: MapBrowserEvent) {
        if (this.elementoResaltado !== null) {
            (this.elementoResaltado as Feature).setStyle(undefined)
            this.elementoResaltado = null;
        }

        this.map.forEachFeatureAtPixel(evento.pixel, feature => {
            this.elementoResaltado = feature;
            (this.elementoResaltado as Feature).setStyle(Estilos.RESALTADO)
            return true;
        })
    }

    mostrarCalles() {
        this.openStreetMap.setVisible(true)
    }

    ocultarCalles() {
        this.openStreetMap.setVisible(false)
    }

    mostrarDistritos() {
        this.distritos.setVisible(true)
    }

    ocultarDistritos() {
        this.distritos.setVisible(false)
    }

    mostrarSecciones() {
        this.secciones.setVisible(true)
    }

    ocultarSecciones() {
        this.secciones.setVisible(false)
    }
}