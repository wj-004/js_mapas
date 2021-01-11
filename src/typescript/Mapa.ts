import { Map, View } from 'ol'
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM'
import FullScreenControl from 'ol/control/FullScreen'
import TileLayer from 'ol/layer/Tile'

export class Mapa {

    private olMap: Map;

    constructor(private contenedor: HTMLElement) {
        const osm = new TileLayer({
            source: new OSM({ attributions: [] })
        })

        // Esto controla el zoom para que se vea solo Buenos Aires (provincia)
        const minExtents = fromLonLat([-64, -42])
        const maxExtents = fromLonLat([-56, -32])

        this.olMap = new Map({
            target: contenedor,
            layers: [osm],
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
    }
    
    iniciarlizar() {
        // Cargar secciones y distritos

        // Cargar mapa de OpenStreetMap

        // Enfocar Buenos Aires

        // Mostrar mapa
    }

    mostrarCalles() {}

    ocultarCalles() {}
}