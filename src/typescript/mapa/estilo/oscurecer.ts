import { Color } from "ol/color"
import * as convert from 'color-convert'

/**
 * Oscurece un color en un porcentaje si su claridad (lightness) es suficiente. Si no, lo deja igual.
 * @param c 
 */
export function oscurecer(c: Color, porcentaje: number): Color {
    const [r, g, b, a] = c
    let [h, s, l] = convert.rgb.hsl([r, g, b])
    if (l - porcentaje >= 0) {
       l = l - porcentaje
    }
    return [
        ...convert.hsl.rgb([h, s, l]),
        a
    ]
}