# API del mapa y sus reemplazos

--------------------------------------------------------------------------
- alClickearCualquierDistrito       |   No necesita reemplazo
- alEnfocar                         |   No necesita reemplazo; se llamara a su callback cuando se cambie **zonaEnfocada**
- deleteIconFeatures                |   setEstado con prop **pines** = []
- enfocarBuenosAires                |   setEstado con prop **zonaEnfocada** = []
- enfocarDistritoPorId              |   setEstado con prop **zonaEnfocada** = [ idDistrito ]
- enfocarDistritos                  |   setEstado con prop **zonaEnfocada** = [ id_1, id_2, ..., id_n ]
- enfocarSecciones                  |   setEstado con prop **zonaEnfocada** = [ id_1, id_2, ..., id_n ]
- enfocarSeccionPorId               |   setEstado con prop **zonaEnfocada** = [ idSeccion ]
- mostrarCalles                     |   setEstado con **zonaEnfocada** = [ ...idDistritos - distritoEnfocado ]
                                    |   y **capas** = [ OpenSM, distritos]
- mostrarDistritos                  |   Idem al anterior
- mostrarPinesEntidadesJudiciales   |   setEstado con prop **pines** = [ pin_1, pin_2, ..., pin_n ]
- mostrarTodosLosIconos             |   setEstado con prop **pines** = [ pin_1, pin_2, ..., pin_n ]
- nivel (propiedad de solo lectura) |   setEstado con prop **capas** = [ distritos ]
- ocultarCalles                     |   setEstado con **zonaEnfocada** = [ idDistrito ] y **capas** = [ distritos ]
- ocultarDistritosEnfocados         |   setEstado con **zonaEnfocada** = []
- ocultarSecciones                  |   setEstado con **capas** = capas - [ secciones ]
- pintarDistritoPorID               |   setEstado con prop **colores** = [ color_1, color_2, ..., color_n ]
- pintarSeccionPorID                |   setEstado con prop **colores** = [ color_1, color_2, ..., color_n ]
- ponerNivelEnTodosLosDistritos     |   setEstado con prop **capas** con "distritos" como ultimo elemento
- soloOcultarCapaOpenStreetMap      |   setEstado con prop **capas** con todo menos capa OpenSM
