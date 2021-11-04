import "https://cdn.jsdelivr.net/npm/mapbox-gl@2.5";
import { busStops } from "./busStops.js";
import { BUS_LINE_COLORS, busLines } from "./busLines.js";

const RANGE_WITHIN = 0.025;
const { Map, GeolocateControl, Marker, Popup } = mapboxgl;

let debounce,
  __markers = [];

const map = new Map({
  container: "map",
  accessToken:
    "pk.eyJ1IjoiZXRoZXJlYWw5NyIsImEiOiJjazk5d3B5bzEwYjZxM2Zud2xmemY1OGZtIn0.68NbqwZ3NoaNsJt5_1FjHg",
  style: "mapbox://styles/ethereal97/ckvlahuqwb17h15o8gb29bb8x",
  center: [96.1462223, 16.7991965],
  zoom: 11,
});

map.addControl(
  new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
    showAccuracyCircle: true,
  })
);

map.on("move", handleEvent);

function handleEvent() {
  debounce && clearTimeout(debounce);
  debounce = setTimeout(() => {
    clearAllMarkers();
    map.getZoom() > 13 && generateToShowMarkers();
  }, 680);
}

function generateToShowMarkers() {
  let center = map.getCenter();
  let stops = busStops.filter((stop) => {
    let x = Math.abs(center.lng - stop.lat);
    let y = Math.abs(center.lat - stop.lng);
    return x < RANGE_WITHIN && y < RANGE_WITHIN;
  });

  stops.forEach((stop) => {
    let option = {
      anchor: "bottom",
      color: "red",
      scale: 0.75,
    };
    let busLineColor = (bus_id) =>
      BUS_LINE_COLORS[busLines.find((bus) => bus.bus_id == bus_id).bus_type] ||
      "bg-gray-200";
    let busLinesContext = stop.bus_ids.map(
      (id) =>
        `<div class="w-8 h-8 flex justify-center items-center shadow rounded font-bold text-white ${busLineColor(
          id
        )}">${id}</div>`
    );
    let popup = new Popup().setHTML(
      `
    <div>
      <div class="mb-2">${stop.name}</div>
      <div class="space-x-1 flex">
        ${busLinesContext.join("")}
      </div>
    <div>`
    );
    let marker = new Marker(option)
      .setLngLat([stop.lat, stop.lng])
      .setPopup(popup)
      .addTo(map);

    __markers.push(marker);
  });
}

function clearAllMarkers() {
  console.log(__markers.length);
  while (__markers.length) {
    __markers.pop().remove();
  }
}

window.map = map;
