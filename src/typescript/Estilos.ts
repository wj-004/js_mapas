import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export const POR_DEFECTO = new Style({
    fill: new Fill({ color: 'rgb(1, 88, 117, 1)' }),
    stroke: new Stroke({
        color: [224, 224, 224, 1],
        width: 1.2,
    })
})

export const SELECCIONADO = new Style({
    fill: new Fill({ color: 'rgba(255, 255, 255, 1)'}),
    stroke: new Stroke({
        color: [2, 139, 156, 1],
        width: 0,
    }),
});

export const MOUSE_HOVER =new Style({
    fill:new Fill({ color: 'rgba(255, 255, 255, 1)'}),
    stroke:new Stroke({
        color: [192, 237, 242, 1],
        width: 4,
    }),
});