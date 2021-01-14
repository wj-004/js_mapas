import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

export const POR_DEFECTO = new Style({
    fill: new Fill({ color: [11, 60, 76, 1] }),
    stroke: new Stroke({
        color: [1, 166, 230, 1],
        width: 2,
    })
})

export const SELECCIONADO = new Style({
    fill: new Fill({ color: [255, 255, 255, 1]}),
    stroke: new Stroke({
        color: [2, 139, 156, 1],
        width: 0,
    }),
});

export const RESALTADO = new Style({
    fill: new Fill({ color: [12, 70, 89, 1] }),
    stroke: new Stroke({
        color: [1, 166, 230, 1],
        width: 4,
    })
});

export const ENTORNO = new Style({
    fill: new Fill({ color: '#015875' }),
    stroke: new Stroke({
        color: '#015875',
        width: 2,
    }),
});