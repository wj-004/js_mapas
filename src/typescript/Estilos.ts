import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export const POR_DEFECTO = new Style({
    fill: new Fill({ color: '#0B3C4C' }),
    stroke: new Stroke({
        color: '#01A6E6',
        width: 2,
    })
})

export const SELECCIONADO = new Style({
    fill: new Fill({ color: 'rgba(255, 255, 255, 1)'}),
    stroke: new Stroke({
        color: [2, 139, 156, 1],
        width: 0,
    }),
});

export const RESALTADO = new Style({
    fill: new Fill({ color: '#0c4659' }),
    stroke: new Stroke({
        color: '#01A6E6',
        width: 4,
    })
})