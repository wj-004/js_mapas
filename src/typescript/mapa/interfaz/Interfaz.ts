import { Selector } from "./Selector";
import { MapaDeBuenosAires } from "../MapDeBuenosAires";
import { Button } from "./Button";
import { Checkbox } from "./CheckBox";

export class Interfaz {
    readonly select         : Selector;
    readonly secciones      : Button;
    readonly municipios     : Button;
    readonly restaurar      : Button;
    readonly switchCalles   : Checkbox;

    constructor(private mapa: MapaDeBuenosAires) {
        this.select = new Selector(
            document.querySelector('#idSecciones'),
            {
                secciones: mapa.obtenerNombresDeZonas('secciones'),
                municipios: mapa.obtenerNombresDeZonas('municipios')
            },
            mapa
        )

        this.secciones      = new Button(document.querySelector('#showSecciones'))
        this.municipios     = new Button(document.querySelector('#showDistritos'))
        this.restaurar      = new Button(document.querySelector('#initialShow'))
        this.switchCalles   = new Checkbox(document.querySelector('#showMapStreets'))

        this.secciones.alHacerClick(() => {
            this.mapa.secciones()
            this.switchCalles.desmarcar()
            this.switchCalles.ocultar()
        })

        this.municipios.alHacerClick(() => {
            this.mapa.municipios()
            this.switchCalles.desmarcar()
            this.switchCalles.ocultar()
        })

        this.restaurar.alHacerClick(() => {
            this.mapa.municipios()
            this.switchCalles.desmarcar()
            this.switchCalles.ocultar()
            localStorage.removeItem('EstadoMapa') // Esto me hace dudar...hace falta?
        })

        this.switchCalles.alHacerClick(boton => {
            this.mapa.alternarVisibilidadDeCalles(boton.checked)
        })
    }
}