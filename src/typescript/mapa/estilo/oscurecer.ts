import { Color } from "ol/color"
import * as convert from 'color-convert'

/**
 * Oscurece un color en 10% si su claridad (lightness) es mayor o igual a 10%. Si no, lo deja igual.
 * @param c 
 */
export function oscurecer(c: Color): Color {
    const [r, g, b, a] = c
    let [h, s, l] = convert.rgb.hsl([r, g, b])
    if (l - 10 >= 0) {
       l = l - 10
    }
    return [
        ...convert.hsl.rgb([h, s, l]),
        a
    ]
}