// import styles 
import 'ol/ol.css';
import './style.css';

//import OL modules 
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON'

//import GeoJSON
const vectorSource = new VectorSource({
  url: 'parroquias_quito.geojson',
  format: new GeoJSON(),
});

const parroquiasLayer = new VectorLayer({
  source: vectorSource,
});

// Create Base Map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({ source: new OSM() }),
    parroquiasLayer,
  ],
  view: new View({
    center: fromLonLat([-78.4678, -0.1807]), // Quito, Ecuador
    zoom: 11,
  })
});


// Create a Feature to contain an Icon
const feature = new Feature({
  geometry: new Point(fromLonLat([-78.4678, -0.1807])),
  name: 'Punto de interés'
});

feature.setStyle(new Style({
  image: new Icon({
    src: 'https://openlayers.org/en/latest/examples/data/icon.png',
    scale: 0.05
  })
}));

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: [feature]
  })
});

map.addLayer(vectorLayer);

// Create popup overlay
const popupElement = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');

const popupOverlay = new Overlay({
  element: popupElement,
  positioning: 'bottom-center',
  offset: [0, -20],
  autoPan: true,
});

map.addOverlay(popupOverlay);


// Containers for Descriptions and Image

const areaTitleContainer =  document.getElementById("area");

const imageContainer = document.getElementById("image");

const descriptionContainer = document.getElementById("description-container");

// Click event
map.on('singleclick', function (evt) {
  let featureFound = false;

  map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    const name = feature.get('dpa_despar');
    popupContent.innerHTML = `<strong>${name}</strong>`;
    popupOverlay.setPosition(evt.coordinate);
    featureFound = true;

    // Clean image container
    imageContainer.innerHTML = '';

    const lowerName = name.toLowerCase().replace(/\s+/g,' ');

    //Check each combination of area and extension to see if exists within the Images folder

    const imagePath =  `/Images/${lowerName}.jpg`;

    imageContainer.src = imagePath;

    /* Retrieve the description of the place from the area_description JSON
      the JSON has the Name in upercase and afterwards the description 
      in lowercase.
    */
    fetch('area_description.json')
    .then(res => res.json())
    .then(data => {
      const areaData = data[lowerName];

      const areaName = areaData.split('.')[0];

      const areaDescription = areaData.split('.')[1];

      areaTitleContainer.innerHTML = `${name} / ${areaName}`;

      descriptionContainer.innerHTML = areaDescription;

  })

  })

});
