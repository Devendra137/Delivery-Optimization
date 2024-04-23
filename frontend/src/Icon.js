import L from "leaflet";
import greenMarker from "./greenmarker.png";
import redMarker from "./redmarker.png";
import blueIcon from "./bluedot.png";

const greenIcon = L.icon({
  iconUrl: greenMarker,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = L.icon({
  iconUrl: redMarker,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueDotIcon = L.icon({
  iconUrl: blueIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export { redIcon, greenIcon, blueDotIcon };
