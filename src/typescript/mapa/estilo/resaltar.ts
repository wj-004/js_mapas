import Style from "ol/style/Style";
import { Color } from 'ol/color'
import * as convert from 'color-convert'

/**
 * Toma un estilo y devuelve otro similar pero con un aspecto resaltado (color mas claro + borde mas grueso)
 * @param estilo 
 */
export function resaltar(estilo: Style): Style {
    const relleno = estilo.getFill().clone()
    relleno.setColor(aclarar(relleno.getColor() as Color))

    const borde = estilo.getStroke().clone()
    borde.setWidth(borde.getWidth() + 2)

    return new Style({ fill: relleno, stroke: borde })
}

/**
 * Incrementa la claridad de un color en 10%, como mucho (hasta un maximo de 100%).
 * 
 * @param c 
 */
function aclarar(c: Color): Color {
    const [r, g, b, a] = c
    let [h, s, l] = convert.rgb.hsl([r, g, b])
    l = l + 10 < 100
        ? l + 10
        : 100;
    return [
        ...convert.hsl.rgb([h, s, l]),
        a
    ]
}