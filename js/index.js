//Carga de parametros por defecto a utilizar

// ---------- START BLOCK DEFINITION OF GLOBAL VARIABLES ----------

var distritosBuenosAiresProvinciaListSource = [];
var seccionesBuenosAiresProvinciaListSource = [];
var isDistritosBsAsSourceLoaded = false;
var isSeccionesBsAsSourceLoaded = false;
var distritosAreLoadedIntoSecciones = false;
var actualHTMLSelectElement = null;
var setMapaCompleto = true;
var seccionesSelectElementId = 'idSecciones';
var distritosSelectElementId = 'idDistritos';

var olMapInstance = null;

// ---------- END BLOCK DEFINITION OF GLOBAL VARIABLES ----------

window.onload = initMap;

// ---------- START BLOCK DEFINITION OF PREDEFINED CONSTANTS ----------

/** DEFINE INITIAL STYLE FOR ALL FEATURES */
const featureInitialFill = new ol.style.Fill({
    color: 'rgb(1, 88, 117, 1)',
});
const featureInitialStroke = new ol.style.Stroke({
    color: [224, 224, 224, 1],
    width: 1.2,
});


/** DEFINE STYLE FOR SELECTED FEATURES */
const featureSelectedStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 1)',
    }),
    stroke: new ol.style.Stroke({
        color: [2, 139, 156, 1],
        width: 0,
    }),
});


/** DEFINE STYLE FOR POINTMOVE OVER FEATURES (TEMPORAL SELECTED FEATURES) */
const featurePointMoveStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 1)',
    }),
    stroke: new ol.style.Stroke({
        color: [192, 237, 242, 1],
        width: 4,
    }),
});

/** DEFINE STYLE FOR NOT SELECTED FEATURES */
const featureNotSelectedFill = new ol.style.Fill({
    color: 'rgb(1, 88, 117, 1)',
});
const featureNotSelectedStroke = new ol.style.Stroke({
    color: [244, 244, 244, 0],
    width: 4,
});
const featureNotSelectedStyle = new ol.style.Style({
    fill: featureNotSelectedFill,
    stroke: featureNotSelectedStroke,
});


/** DEFINE LAYERS STYLE */
const distritosBuenosAiresProvinciaStyle = new ol.style.Style({
    fill: featureInitialFill,
    stroke: featureInitialStroke,
});
const seccionesBuenosAiresProvinciaStyle = new ol.style.Style({
    fill: featureInitialFill,
    stroke: featureInitialStroke,
});


/** DEFINE SOURCES */
//Buenos Aires Provincia - PARTIDOS
const distritosBuenosAiresProvinciaSource = new ol.source.Vector({
    url: '../data/vector_data/municipios-buenos_aires.geojson',
    format: new ol.format.GeoJSON()
});

//Buenos Aires Provincia - SECCIONES
const seccionesBuenosAiresProvinciaSource = new ol.source.Vector({
    url: '../data/vector_data/secciones-buenos_aires.geojson',
    format: new ol.format.GeoJSON()
});


/** DEFINE MAP LAYER - INITIALIZE MAP */
const mapLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    opacity: 1,
});

const mapExtent = ol.proj.fromLonLat(
    [-64, -42]).concat(ol.proj.fromLonLat([-56, -32])   // [-x, -y, +x, +y]
    );
const mapView = new ol.View({
    center: ol.proj.fromLonLat([-60, -37.3]),
    extent: mapExtent,  //recortar el mapa a las dimensiones dadas
    zoom: 0,
    maxResolution: 156543.03,
    minResolution: 1,
    showFullExtent: true,
});
const mapInteractions = ol.interaction.defaults({
    doubleClickZoom: false,
    dragAndDrop: false,
    dragPan: true,           //desplazamiento
    keyboardPan: false,
    keyboardZoom: false,
    mouseWheelZoom: true,
    pointer: true,
    select: false
});


/** DEFINE OTHER LAYERS */
const distritosBuenosAiresProvincia = new ol.layer.Vector({
    source: distritosBuenosAiresProvinciaSource,
    visible: true,
    style: distritosBuenosAiresProvinciaStyle,
});
const seccionesBuenosAiresProvincia = new ol.layer.Vector({
    source: seccionesBuenosAiresProvinciaSource,
    visible: true,
    style: seccionesBuenosAiresProvinciaStyle,
});


// ---------- END BLOCK DEFINITION OF PREDEFINED CONSTANTS ----------

function initMap() {

    //initialization of map base
    this.olMapInstance = OLMap.getOLMapInstance();
    let olMap = this.olMapInstance;
    mapLayer.setVisible(false);


    //idSecciones for default id select element
    actualHTMLSelectElement = document.getElementById('idSecciones');

    //load buenos aires features
    olMap.getMapInstance().addLayer(distritosBuenosAiresProvincia);
    olMap.getMapInstance().addLayer(seccionesBuenosAiresProvincia);

    //LOAD FEATURES TO LISTS FOR BETTER ACCESS TO THEM
    distritosBuenosAiresProvinciaSource.on('change', function (evt) {
        var source = evt.target;
        if (source.getState() === 'ready' && !isDistritosBsAsSourceLoaded) {
            source.getFeatures().forEach(function (feature) {
                var id = feature.get('id');
                var departamento = feature.get('departamento');

                if (isDefinedAndNotNull(id) && isDefinedAndNotNull(departamento)) {
                    distritosBuenosAiresProvinciaListSource[id] = [id, departamento, feature];
                }
            });
            if (distritosBuenosAiresProvinciaListSource.length > 0) {
                isDistritosBsAsSourceLoaded = true;
            }
        }
    });

    seccionesBuenosAiresProvinciaSource.on('change', function (evt) {
        var source = evt.target;
        if (source.getState() === 'ready' && !isSeccionesBsAsSourceLoaded) {
            source.getFeatures().forEach(function (feature) {
                var id = feature.get('id');
                var seccion = feature.get('nombreSeccion');

                if (isDefinedAndNotNull(id) && isDefinedAndNotNull(seccion)) {
                    seccionesBuenosAiresProvinciaListSource[id] = [id, seccion, feature];
                }
            });
            if (seccionesBuenosAiresProvinciaListSource.length > 0) {
                isSeccionesBsAsSourceLoaded = true;
                listFeaturesOnHTML(seccionesBuenosAiresProvinciaListSource);
            }

            //Una vez que los distritos esten cargados, se realiza su carga en cada seccion
            if (isDistritosBsAsSourceLoaded && isSeccionesBsAsSourceLoaded
                && !distritosAreLoadedIntoSecciones) {
                loadDistritosToSecciones();
                distritosAreLoadedIntoSecciones = true;
            }
        }
    });


    //add points received to seccionesBuenosAiresProvincia feature
    addPopupToMap();

    //CLICK OVER FEATURES INTERACTION - DEFINE STYLE
    var block = false;
    olMap.getMapInstance().on("click", function (e) {

        olMap.getMapInstance().forEachFeatureAtPixel(e.pixel, function (feature) {
            if (feature.getGeometry().getType() !== 'Polygon'
                && feature.getGeometry().getType() !== 'MultiPolygon') {
                return;
            }
            if (block) {
                block = false;
                return;
            }
            //verificar si el feature clickeado es seccion o distrito
            if (feature.get('nombreSeccion')) {
                block = true;
                navigateBetweenSeccionLayers(feature);
                return;
            }
            else if (feature.get('departamento') && !block) {
                listFeaturesOnHTML(distritosBuenosAiresProvinciaListSource);
                navigateBetweenDistritoLayers(feature);
            }
        });
    });

    //POINTER MOVE OVER FEATURES INTERACTION - DEFINE STYLE
    olMap.getMapInstance().on('pointermove', function (e) {
        if (olMap.getCurrentFeatureSelected() != null
            && olMap.getCurrentFeatureSelected().isObtainedByClick()) {
            return;
        }
        olMap.getMapInstance().forEachFeatureAtPixel(e.pixel, function (feature) {
            if (feature.getGeometry().getType() !== 'Polygon'
                && feature.getGeometry().getType() !== 'MultiPolygon') {
                return;
            }
            setFeatureSelectedStyle(feature, featurePointMoveStyle, false);
        });
    });
}


/**
 * Its necessary to have .png extension files and the same name between entitys and files
 * @param {*} entityName 
 * @param {*} latLonAsArray 
 */
function doIconFeature(entityName, path, latLonAsArray) {
    var name = entityName;
    var source = 'https://openlayers.org/en/latest/examples/data/icon.png';

    if (isDefinedAndNotNull(name)) {
        //replace whitespaces to low ion and then save to 'source' variable
        //source = path +"/pin-"+ name.replace(/\s/g, "_") +".png";
        source = path + "/pin-01.png";
    }

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(latLonAsArray)),
        name: name
    });

    var imageStyle = new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: source,
    });

    var iconStyle = new ol.style.Style({
        image: imageStyle
    });

    iconFeature.setStyle(iconStyle);

    return iconFeature;
}

function addIconToFeature(name, lonLatAtArray) {
    var images_path = '../img/national-entities/map-pins';
    addFeatureToLayers(
        doIconFeature(name, images_path, lonLatAtArray)
    );
}

function addPopupToMap() {

    map = this.olMapInstance.getMapInstance();
    // Popup showing the position the user clicked
    var popupTop = new ol.Overlay({
        element: document.getElementById('top-popup'),
    });
    map.addOverlay(popupTop);

    //TODO FIX THIS - get map dimensions for the popupTop
    var mapWidth = document.getElementById('map').clientWidth;
    var centerX = "a";
    var position = [centerX, 0];

    map.on('pointermove', function (evt) {
        var element = popupTop.getElement();
        var coordinate = evt.coordinate;
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });

        if (feature) {
            if (isDefinedAndNotNull(feature.get('name'))) {
                content = feature.get('name');
            }
            else if (isDefinedAndNotNull(feature.get('nombreSeccion'))) {
                content = feature.get('nombreSeccion');
            }
            else if (isDefinedAndNotNull(feature.get('departamento'))) {
                content = feature.get('departamento');
            }
            else {
                content = '';
            }
            $(element).popover('dispose');
            popupTop.setOffset(position);
            popupTop.setPosition(coordinate);
            $(element).popover({
                container: element,
                placement: 'top',
                animation: false,
                html: true,
                content:
                    '<div class="card " style="border-radius: 1em/5em; ">'
                    + '<h5 class="font-weight-bold btn btn-outline-primary mb-1 mt-1 border-0 disabled">'
                    + content
                    + '</h5>'
                    + '</div>'
            });
            $(element).popover('show');
        }
        else {
            $(element).popover('dispose');
        }
    });

}

function addFeatureToLayers(iconFeature) {
    distritosBuenosAiresProvinciaSource.addFeatures([
        iconFeature,
    ]);
}

function deleteIconFeatures() {
    distritosBuenosAiresProvinciaSource.getFeatures().forEach(function (feature) {
        if (feature.getGeometry().getType() === 'Point') {
            distritosBuenosAiresProvinciaSource.removeFeature(feature);
        }
    });
}

function setFocusToFeature(feature) {

    setMapaCompleto = false;

    //enableMapLayer(true);
    var extent = feature.getGeometry().getExtent();
    mapView.fit(extent);

    //revisar si es seccion o distrito - NORMALIZAR
    var isSeccion = true;
    if (feature.get('departamento')) {
        isSeccion = false;
    }

    if (isSeccion) {
        changeNotAtListFeatureStyle(
            [[feature.get('id'), feature.get('nombreSeccion'), feature]],
            true
        );
    }
    else {
        changeNotAtListFeatureStyle(
            [[feature.get('id'), feature.get('departamento'), feature]],
            false
        );
    }


    //TODO Fix this
    //codigo que busca evitar que, tras hacer un fix a un feature, se pueda salir del mismo
    /*
    let map = this.olMapInstance.getMapInstance();

    var nc_array = extent;
    var dragMargin = 100000;
    var nc_w = nc_array[0] - dragMargin;
    var nc_s = nc_array[1] - dragMargin;
    var nc_e = nc_array[2] + dragMargin;
    var nc_n = nc_array[3] + dragMargin;

    map.on('moveend', function() {
        //get current extent
        if (setMapaCompleto) {
            return;
        }
        var ext_array = mapView.calculateExtent(map.getSize());
        var ext_w = ext_array[0];
        var ext_s = ext_array[1];
        var ext_e = ext_array[2];
        var ext_n = ext_array[3];
        //TODO hacer este cambio mas ameno
        if(ext_s < nc_s || ext_w < nc_w || ext_n > nc_n || ext_e > nc_e) {
            mapView.fit(extent);
        }
    });*/
}

function enableMapLayer(enable = true) {
    mapLayer.setVisible(enable);
}


function enableDragPan(enable = true) {
    var dragPan;
    this.olMapInstance.getMapInstance().getInteractions().forEach(function (interaction) {
        if (interaction instanceof ol.interaction.DragPan) {
            dragPan = interaction;
        }
    }, this);
    if (dragPan && !enable) {
        this.olMapInstance.getMapInstance().removeInteraction(dragPan);
    }
    else if (enable && !dragPan) {
        this.olMapInstance.getMapInstance().addInteraction(
            new ol.interaction.DragPan()
        );
    }
}


function showFeatureSelectedInMap(feature = null, interactionOnMap = null, zoom = false) {

    var olMap = this.olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = olMapInstance;
    }


    if (!(isDefinedAndNotNull(feature) || isDefinedAndNotNull(interactionOnMap))
        || !isDefinedAndNotNull(olMap)) {
        return;
    }

    if (interactionOnMap !== null) {
        feature = getFeatureSelectedByMapInteraction(interactionOnMap, olMap);
    }

    setFeatureSelectedStyle(feature, featureSelectedStyle, true);

    //TODO Arreglar
    if (olMap.isPreviousTheSameThatCurrent()) {
        olMap.setFeatureSelected(null);
        olMap.setPreviousFeatureSelected(null);
    }

    document.getElementById(actualHTMLSelectElement.id).value = olMap.getCurrentFeatureSelected().getFeatureId();

    if (zoom) {
        setFocusToFeature(feature);
    }

}


function getFeatureSelectedByMapInteraction(e, olMap) {

    if (!(isDefinedAndNotNull(olMap) && isDefinedAndNotNull(e))) {
        return;
    }

    return olMap.getMapInstance().forEachFeatureAtPixel(e.pixel, function (feature) {
        return feature;
    });
}

function listFeaturesOnHTML(featureList) {
    var selectElement = document.getElementById(actualHTMLSelectElement.id);

    //clear list and create element 'Todos'
    cleanHTMLSelectMenu();

    //First option element 'Todos'
    var optionElement = document.createElement('option');
    optionElement.appendChild(document.createTextNode('Todos'));
    optionElement.value = '-1';
    selectElement.appendChild(optionElement);

    if (actualHTMLSelectElement == null) {
        return;
    }

    let features = featureList;
    //ordenar alfabeticamente A-Z
    features.sort((a, b) => (a[1] > b[1]) ? 1 : -1);

    features.forEach(function (feature) {
        var optionElement = document.createElement('option');
        optionElement.appendChild(document.createTextNode(feature[1]));
        optionElement.value = feature[0];

        selectElement.appendChild(optionElement);
    });
}

function cleanHTMLSelectMenu() {
    var selectElement = document.getElementById(actualHTMLSelectElement.id);
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.lastChild);
    }
}

function obtenerDatosFeature() {

    //si el elemento seleccionado es 'Todos' con valor '-1'
    if (document.getElementById(actualHTMLSelectElement.id).value == '-1') {
        //volver todo a vista por defecto - comparte logica con selectFeature
        changeHTMLElementId(actualHTMLSelectElement.id, seccionesSelectElementId)
        setSeccionesLayer();
        setMapaBuenosAiresCompleto();
    }

    var selectElement = actualHTMLSelectElement;

    //Si se selecciona 'Todos' o no hay nada seleccionado, se vuelve al mapa completo
    if (isDefinedAndNotNull(selectElement) && selectElement.value < 0) {
        setMapaBuenosAiresCompleto();
        return;
    }

    if (this.olMapInstance.getCurrentFeatureSelected() !== null) {
        this.olMapInstance.getCurrentFeatureSelected().getFeature().setStyle(undefined);
        this.olMapInstance.setFeatureSelected(null);
    }

    let listSource = null;
    let isSecciones = false;
    if (selectElement.id == seccionesSelectElementId) {
        listSource = seccionesBuenosAiresProvinciaListSource;
        isSecciones = true;
    }
    else if (selectElement.id == distritosSelectElementId) {
        listSource = distritosBuenosAiresProvinciaListSource;
    }
    //Recovered the OLFeature by selectElement value
    var featureArraySelected = null;
    listSource.forEach(function (source) {
        if (source[0] == selectElement.value) {
            featureArraySelected = source;
        }
    })

    if (!isDefinedAndNotNull(featureArraySelected) || featureArraySelected.length <= 0) {
        return;
    }

    var feature = featureArraySelected[2];

    //marcamos en el mapa el feature seleccionado
    if (isSecciones) {
        navigateBetweenSeccionLayers(feature);
    }
    else {
        navigateBetweenDistritoLayers(feature);
    }

}

function changeHTMLElementId(actualId, newId) {
    document.getElementById(actualId).id = newId;
    actualHTMLSelectElement = document.getElementById(newId);
}

function setMapaBuenosAiresCompleto() {
    mapView.fit(mapExtent);
    mapLayer.setVisible(false);
    setMapaCompleto = true;
    enableMapLayer(false);
    var style = new ol.style.Style({
        fill: featureInitialFill,
        stroke: featureInitialStroke,
    });
    distritosBuenosAiresProvincia.setStyle(style);
    seccionesBuenosAiresProvincia.setStyle(style);

    document.getElementById(actualHTMLSelectElement.id).value = -1;

    var olMap = olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = this.olMapInstance;
    }
    if (olMap.getCurrentFeatureSelected() == null) {
        return;
    }
    olMap.getCurrentFeatureSelected().getFeature().setStyle(undefined);
    olMap.setFeatureSelected(null);

}


/**
 * First the map is cleaned setting null the latest feature selected (feature saved)
 *  and then the style is applied
 */
function setFeatureSelectedStyle(feature, Style, save = false) {

    //check if some param required is null
    if (!(isDefinedAndNotNull(feature) && isDefinedAndNotNull(Style))) {
        return;
    }

    var olMap = olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = this.olMapInstance;
    }

    if (olMap.getCurrentFeatureSelected() !== null) {
        olMap.getCurrentFeatureSelected().getFeature().setStyle(undefined);
        olMap.setFeatureSelected(null);
    }

    feature.setStyle(Style);
    let olFeature = new OLFeature(feature, feature.get('id'));
    save ? olMap.setFeatureSelected(olFeature) : olMap.setFeaturePointMove(olFeature);
    return true;
}

function isDefinedAndNotNull(variable) {
    return (typeof variable !== 'undefined' && variable !== null);
}


class OLMap {

    static olMapInstance = null;

    //actualFeature is used to define the feature selected
    actualFeature = null;

    //featurePointMove is used to save temporal selection for pointmove action
    featurePointMove = null

    //previousFeatureId is used to deselect the actualFeature
    previousFeatureId = null;


    constructor(mapInstance) {
        this.mapInstance = mapInstance;
    }

    static getOLMapInstance() {
        return (this.olMapInstance == null) ? this.newOLMap() : this.olMapInstance;
    }

    static newOLMap() {
        return new OLMap(
            new ol.Map({
                view: mapView,
                interactions: mapInteractions,
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: true,
                }),
                layers: [
                    mapLayer,
                ],
                target: 'map',
                controls: [new ol.control.FullScreen(),]
            })
        );
    }

    getMapInstance() {
        return this.mapInstance;
    }

    setFeatureSelected(OLFeatureInstance) {
        if (this.actualFeature !== null) {
            this.setPreviousFeatureSelected(this.actualFeature.getFeature().get('id'));
        }
        else {
            this.setPreviousFeatureSelected(null);
        }
        this.actualFeature = OLFeatureInstance;
    }

    setPreviousFeatureSelected(featureId) {
        this.previousFeatureId = featureId;
    }

    setFeaturePointMove(OLFeatureInstance) {
        this.featurePointMove = OLFeatureInstance;
    }

    /**
     * If the actualFeature (assigned by click) is null, returns the temporal feature (featurePointMove)
     */
    getCurrentFeatureSelected() {
        return this.actualFeature ?? this.featurePointMove;
    }

    getPreviousFeatureSelectedId() {
        return this.previousFeatureId;
    }

    isPreviousTheSameThatCurrent() {

        if (this.actualFeature == null || this.previousFeatureId == null) {
            return false;
        }

        return (this.actualFeature.getFeatureId() == this.previousFeatureId);
    }

};

class OLFeature {

    constructor(featureObject, featureId = null, obtainedByClick = false) {
        this.featureObject = featureObject;
        this.featureId = featureId;
        this.obtainedByClick = obtainedByClick;
    }

    setFeatureObtaniedByClick() {
        this.obtainedByClick = true;
    }

    isObtainedByClick() {
        return this.obtainedByClick;
    }

    getFeature() {
        return this.featureObject;
    }

    setFeature(Feature) {
        this.featureObject = Feature;
    }

    getFeatureId() {
        return this.featureId;
    }
}

function selectLayer() {
    let optionElements = document.getElementsByName('mapShowOption');
    let checked = null;

    //get the current id for select html element
    this.actualHTMLSelectElement = document.getElementById(seccionesSelectElementId)
        ?? document.getElementById(distritosSelectElementId);

    for (i = 0; i < optionElements.length; i++) {
        if (optionElements[i].checked) {
            checked = optionElements[i].value;
        }
    }

    if (checked == 1) {
        //Change the element id
        changeHTMLElementId(actualHTMLSelectElement.id, seccionesSelectElementId)
        //shows Secciones
        setSeccionesLayer();
        setMapaBuenosAiresCompleto();
    }
    else if (checked == 2) {
        //Change the element id
        changeHTMLElementId(actualHTMLSelectElement.id, distritosSelectElementId)
        //shows Distritos/Municipios
        setDistritosLayer();
    }
    else if (checked == '3') {
        if (this.olMapInstance.getCurrentFeatureSelected() == null) { return; }
        //Change the element id
        changeHTMLElementId(actualHTMLSelectElement.id, seccionesSelectElementId)
        setSeccionesLayer();
        setMapaBuenosAiresCompleto();
    }
}

function setSeccionesLayer() {
    seccionesBuenosAiresProvincia.setVisible(true);
    distritosBuenosAiresProvincia.setVisible(false);

    //se deshabilita, o se asegura que este deshabilitado, la vista de calles
    setStreetMapVisibility(false, true);

    var style = seccionesBuenosAiresProvinciaStyle;
    seccionesBuenosAiresProvincia.setStyle(style);

    changeHTMLElementId(actualHTMLSelectElement.id, seccionesSelectElementId);
    listFeaturesOnHTML(seccionesBuenosAiresProvinciaListSource);
}

function setDistritosLayer(distritos = null) {
    var distritosToShow = isDefinedAndNotNull(distritos) ? distritos : distritosBuenosAiresProvinciaListSource;

    distritosBuenosAiresProvincia.setVisible(true);
    seccionesBuenosAiresProvincia.setVisible(false);

    //definir el estilo de los feature no seleccionados
    var style = distritosBuenosAiresProvinciaStyle;
    distritosBuenosAiresProvincia.setStyle(style);

    changeHTMLElementId(actualHTMLSelectElement.id, distritosSelectElementId);
    listFeaturesOnHTML(distritosToShow);
    changeNotAtListFeatureStyle(distritosToShow, false);
}

//change only the features in the same layer that aren't in the list
function changeNotAtListFeatureStyle(featuresAtList, isSeccionesLayer = false) {
    if (isSeccionesLayer) {
        return;
    }

    distritosBuenosAiresProvinciaListSource.forEach(function (featureAtSource) {
        featureAtSource[2].setStyle(undefined);

        var existsInList = false;
        featuresAtList.forEach(function (featureInList) {
            if (isDefinedAndNotNull(featureInList) && (featureInList[0] == featureAtSource[0])) {
                existsInList = true;
            }
        });
        if (existsInList == false) {
            featureAtSource[2].setStyle(featureNotSelectedStyle);
        }
    })
}


//hasta el momento, este evento solo debe ser utilizado para mostrar un distrito.
//cuando se adapte a secciones tambien, u otras cosas, borrar este comentario
window.addEventListener('show-map', event => {
    deleteIconFeatures();
    var data = event.detail.data;

    if (!isDefinedAndNotNull(data)) {
        console.log('Data is not defined. Data contain: ');
        console.log(data);
        return;
    }

    var idByDistritoId = data.distrito_id;
    var distritoId = data.id;
    var distritoName = data.distrito;
    if (!isDefinedAndNotNull(idByDistritoId)) {
        if (!isDefinedAndNotNull(distritoId)) {
            if (!isDefinedAndNotNull(distritoName)) {
                console.log("<data.id> and <data.distrito> don't exist. Event <show-map>");
                return;
            }
            console.log("distritoName" + distritoName);
            distritoId = null;
        }
        idByDistritoId = null;
        console.log("distrioId " + distritoId);
    }
    else {
        console.log("idByDistritoId " + idByDistritoId)
    }

    if (!isDefinedAndNotNull(distritoId) && !isDefinedAndNotNull(distritoName) && !isDefinedAndNotNull(idByDistritoId)) {
        console.log("Distrito name and id are null or undefined. Event <show-map>")
        return;
    }

    var name = data.tipo;
    if (isDefinedAndNotNull(name)) {
        name = '';
    }

    var olMap = this.olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = olMapInstance;
    }

    if (isDefinedAndNotNull(data.pin)) {
        data.pines.forEach(function (pin) {
            addIconToFeature(pin.name, [pin.lon, pin.lat]);
        });
    }

    var feature = null;

    //If distritoName exists, distritoId and idByDistritoId don't. So its necessary to give with name
    //PRIMERO se busca por nombre.. si el nombre no existe, se pasa a buscar por .distrito_id.. 
    //si tampoco existe se toma de .id 
    if (distritoName != null) {
        distritosBuenosAiresProvinciaListSource.forEach(function (f) {
            if (f[2].get('departamento') == distritoName.toUpperCase()) {
                feature = f[2];
            }
        });
    }
    else {
        if (feature === null) {
            distritosBuenosAiresProvinciaListSource.forEach(function (f) {
                if (f[0] == idByDistritoId) {
                    feature = f[2];
                    return;
                }
            });
            if (feature == null) {
                distritosBuenosAiresProvinciaListSource.forEach(function (f) {
                    if (f[0] == distritoId) {
                        feature = f[2];
                        return;
                    }
                });
            }
        }
    }

    if (feature === null) {
        distritoName = data.distritoName;
        distritosBuenosAiresProvinciaListSource.forEach(function (f) {
            if (f[2].get('departamento') == distritoName.toUpperCase()) {
                feature = f[2];
            }
        });

        if (feature === null) {
            console.log('<feature> had not be recovery from the list. Event <show-map>');
            console.log(feature);
            return;

        }
    }

    //CONDICION PARA MOSTRAR UN PIN EN ZARATE - ID 170
    if (feature.get('id') == 170) { //zarate
        addIconToFeature(name, [-59.025131860019044, -34.09831043295503]);
    }
    if (feature.get('id') == 164) { //magdalena
        addIconToFeature(name, [-57.51787463150694, -35.078943119444396]);
    }
    if (feature.get('id') == 145) { //chascomus
        addIconToFeature(name, [-58.01096274050207, -35.57279000176888]);
    }
    if (feature.get('id') == 168) { //campana
        addIconToFeature(name, [-58.96836349636342, -34.148253154266605]);
    }

    setDistritosLayer();
    showFeatureSelectedInMap(feature, null, true);
    olMap.getCurrentFeatureSelected().setFeatureObtaniedByClick();

})

function test() {
    deleteIconFeatures();
    var data = {
        distrito_id: 164,
        distrito: 'Magdalena',
        tipo: 'PRUEBA'
    };

    if (!isDefinedAndNotNull(data)) {
        console.log('Data is not defined. Data contain: ');
        console.log(data);
        return;
    }

    var distritoId = data.distrito_id;
    var distritoName = null;
    if (!isDefinedAndNotNull(distritoId)) {
        if (!isDefinedAndNotNull(data.distrito)) {
            console.log("<data.distrito_id> and <data.distrito> don't exist. Event <show-map>");
            return;
        }
        distritoId = null;
        distritoName = data.distrito;
    }

    if (!isDefinedAndNotNull(distritoId) && !isDefinedAndNotNull(distritoName)) {
        console.log("Distrito name and id are null or undefined. Event <show-map>")
        return;
    }

    var name = data.tipo;
    if (isDefinedAndNotNull(name)) {
        name = '';
    }

    var olMap = this.olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = olMapInstance;
    }

    if (isDefinedAndNotNull(data.pin)) {
        data.pines.forEach(function (pin) {
            addIconToFeature(pin.name, [pin.lon, pin.lat]);
        });
    }

    var feature = null;

    //If distritoName exists, distritoId doesn't. So its necessary to give with name
    if (distritoName != null) {
        distritosBuenosAiresProvinciaListSource.forEach(function (f) {
            if (f[2].get('departamento') == distritoName.toUpperCase()) {
                feature = f[2];
            }
        });
    }
    else {
        distritosBuenosAiresProvinciaListSource.forEach(function (f) {
            if (f[0] == distritoId) {
                feature = f[2];
                return;
            }
        });
    }

    if (feature === null) {
        console.log('<feature> had not be recovery from the list. Event <show-map>');
        console.log(feature);
        return;
    }
    console.log(feature.get('id'));

    if (feature.get('id') == 170) { //zarate
        addIconToFeature(name, [-59.025131860019044, -34.09831043295503]);
    }
    if (feature.get('id') == 164) { //magdalena
        addIconToFeature(name, [-57.51787463150694, -35.078943119444396]);
    }
    if (feature.get('id') == 145) { //chascomus
        addIconToFeature(name, [-58.01096274050207, -35.57279000176888]);
    }
    if (feature.get('id') == 168) { //campana
        addIconToFeature(name, [-58.96836349636342, -34.148253154266605]);
    }

    setDistritosLayer();
    showFeatureSelectedInMap(feature, null, true);
    olMap.getCurrentFeatureSelected().setFeatureObtaniedByClick();
}


/**
 * Aca se busca realizar una funcion que permita:
 *  DESHABILITAR las secciones a fines de mostrar solamente los distritos correspondientes
 *  CAMBIAR buscador para navegar entre SOLAMENTE los distritos de la seccion
 */
function navigateBetweenSeccionLayers(feature) {
    if (!isDefinedAndNotNull(feature)) {
        return;
    }

    //primero se asegura que el feature este habilitado
    seccionesBuenosAiresProvincia.setVisible(true);
    listFeaturesOnHTML(distritosBuenosAiresProvinciaListSource);

    let olMap = this.olMapInstance;
    if (!isDefinedAndNotNull(olMap)) {
        olMap = olMapInstance;
    }


    //se enfoca a la seccion correspondiente
    showFeatureSelectedInMap(feature, null, true);
    olMap.getCurrentFeatureSelected().setFeatureObtaniedByClick();

    var seccion = null;
    seccionesBuenosAiresProvinciaListSource.forEach(function (s) {
        if (s[0] == feature.get('id')) {
            seccion = s;
        }
    });

    if (seccion == null) {
        console.log('Function navigateBetweenSeccionLayers. <seccion> is null')
        return;
    }

    var distritosListSource = seccion[3];

    //cambiar el estilo de los distritos, ocultando los que no estan en la lista
    setDistritosLayer(distritosListSource);
}

function loadDistritosToSecciones() {
    console.log('Loading link between secciones and distritos');
    //primero verificamos que ambos esten cargados
    if (!isDefinedAndNotNull(distritosBuenosAiresProvinciaListSource)
        || !isDefinedAndNotNull(seccionesBuenosAiresProvinciaListSource)) {
        console.log('loadDistritosToSecciones function finished. There are any distritos or secciones loaded');
        return;
    }

    //carga de distritos en las secciones
    var seccionDataList = getSeccionDataList();

    /**
     * Primero agarramos los datos de la funcion (seccion -> listaDistritos)
     * Recorremos por cada seccion
     *      recorremos la lista de secciones
     *          armamos un array de distritos a almacenar (ej. arrayDistritos[])
     *          recorremos por cada distrito en seccionData
     *              recorremos la lista de distritos
     *                  cuando coincide, almacenamos el distrito (ej. arrayDistritos.push(distrito))
     */
    seccionDataList.forEach(function (seccionData) {
        seccionesBuenosAiresProvinciaListSource.forEach(function (seccion) {
            if (seccionData.id == seccion[0]) {
                var distritos = [];
                seccionData.distritos.forEach(function (distritoDataId) {
                    distritosBuenosAiresProvinciaListSource.forEach(function (distrito) {
                        if (distritoDataId == distrito[0]) {
                            distritos.push(distrito);
                        }
                    });
                });
                seccion[3] = distritos;
            }
        });
    });
}

function navigateBetweenDistritoLayers(feature) {
    if (!isDefinedAndNotNull(feature)) {
        return;
    }
    let olMap = this.olMapInstance;

    //primero se asegura que el feature este habilitado y cargados los elementos
    setDistritosLayer();

    //se enfoca al distrito correspondiente
    showFeatureSelectedInMap(feature, null, true);
    olMap.getCurrentFeatureSelected().setFeatureObtaniedByClick();
    setStreetMapVisibility(false, false);
}

//aca se cargan todos los partidos correspondientes a las secciones
function getSeccionDataList() {
    return [
        { id: 1, distritos: [150, 151, 166, 167, 168, 58, 61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 76, 79, 83, 86, 92] },
        { id: 2, distritos: [169, 170, 171, 172, 173, 174, 175, 51, 52, 53, 54, 55, 56, 57, 59] },
        { id: 3, distritos: [146, 147, 148, 149, 163, 164, 165, 78, 82, 84, 87, 88, 89, 91, 94, 95, 96, 97, 98] },
        { id: 4, distritos: [101, 105, 107, 108, 115, 152, 380, 396, 398, 399, 60, 63, 75, 77, 80, 81, 85, 90, 99] },
        { id: 5, distritos: [102, 103, 109, 110, 112, 116, 117, 121, 123, 126, 127, 128, 134, 142, 143, 144, 145, 153, 155, 156, 157, 158, 159, 160, 161, 162] },
        { id: 6, distritos: [119, 120, 124, 125, 129, 130, 131, 132, 133, 135, 136, 137, 138, 139, 140, 141, 154, 379, 381, 382, 383, 391] },
        { id: 7, distritos: [100, 104, 106, 111, 113, 114, 118, 122] },
        { id: 8, distritos: [93] },
    ];
}


$("#showMapStreets").on('change', function () {
    var feature = olMapInstance.getCurrentFeatureSelected();
    if (!isDefinedAndNotNull(feature)) {
        return;
    }

    var status = false;
    if ($(this).is(':checked')) {
        status = true;
    }
    else {
        status = false;
    }
    setStreetMapVisibility(status, false);


    var style = featureSelectedStyle;
    if (status) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(244, 244, 244, 0)',
            }),
            featureNotSelectedStroke
        });
    }
    feature.getFeature().setStyle(style);

});

function setStreetMapVisibility(visible = false, disabled = true) {

    mapLayer.setVisible(visible);
    var checkbox = document.getElementById("showMapStreets");
    checkbox.disabled = disabled;
    checkbox.value = visible;
    checkbox.checked = visible;
}