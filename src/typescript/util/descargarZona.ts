import { GeoJSON } from 'ol/format'
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";

export function descargarZona(geoJsonUrl: string): Promise<Feature<Geometry>[]> {
    const format = new GeoJSON();

    return fetch(geoJsonUrl)
        .then(response => response.json())
        .then(geoJ => format.readFeatures(geoJ, { featureProjection: 'EPSG:3857' }))
}

export function descargarZonas(urls: string[]): Promise<Feature<Geometry>[][]> {
    return Promise.all(urls.map(descargarZona))
}