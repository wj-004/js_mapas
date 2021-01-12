import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { GeoJSON } from 'ol/format'

export function getLayer(geoJsonUrl: string): Promise<VectorLayer> {
    const format = new GeoJSON();

    return fetch(geoJsonUrl)
        .then(response => response.json())
        .then(geoJ => format.readFeatures(geoJ, { featureProjection: 'EPSG:3857' }))
        .then(features =>
            new VectorLayer({
                source: new VectorSource({ features, format })
            })
        )
}