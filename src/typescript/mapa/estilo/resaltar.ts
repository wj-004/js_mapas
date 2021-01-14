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
    borde.setWidth(4)

    return new Style({ fill: relleno, stroke: borde })
}

/**
 * Aclara un color en 10% si su claridad (lightness) es menor 100%. Si no, lo deja igual.
 * @param c 
 */
function aclarar(c: Color): Color {
    const [r, g, b, a] = c
    let [h, s, l] = convert.rgb.hsl([r, g, b])
    if (l + 10 < 100) {
       l = l + 10
    }
    return [
        ...convert.hsl.rgb([h, s, l]),
        a
    ]
}