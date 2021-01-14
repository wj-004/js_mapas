import * as convert from 'color-convert'
import { Color } from 'ol/color'

export function hexToColor(hex: string, opacidad = 1): Color {
    return [
        ...convert.hex.rgb(hex),
        opacidad
    ]
}