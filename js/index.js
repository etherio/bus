import "./core/index.js";
import "https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js";
import "https://cdn.jsdelivr.net/npm/mapbox-gl@2.5";
import { findNearestBusStops } from "./lib/busStops.js";
import { busLineColor } from "./lib/busLines.js";

const { Map, GeolocateControl, Marker, Popup } = mapboxgl;

let debounce,
  __markers = [];

const nearestBusStops = new Vue({
  el: "#nearest-bus-stops",
  data: {
    bottomSheet: "translate-y-80",
    busStops: [],
  },
  methods: {
    busLineColor,
  },
  computed: {
    nearestTotal() {
      return this.busStops.length;
    },
  },
  watch: {
    busStops(newData, oldData) {
      if (newData.length > 0 && oldData.length != newData.length) {
        setTimeout(() => (this.bottomSheet = "translate-y-0"), 2100);
      }
    },
  },
});

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
    showAccuracyCircle: false,
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
  let stops = findNearestBusStops(center.lng, center.lat);
  console.log(stops.length, typeof stops[0].bus_ids[0]);

  stops.map((stop) => {
    let element = document.createElement("div");
    let busLinesContext = stop.bus_ids.map(
      (id) =>
        `<div class="w-6 h-6 flex justify-center items-center shadow rounded font-semibold text-white text-sm pb-1 ${busLineColor(
          id
        )}">${id.toBurmeseString()}</div>`
    );
    let popup = new Popup().setHTML(
      `
          <div>
          <div class="mb-2">${stop.name}</div>
          <div class="grid grid-cols-4 gap-1 place-items-center">
          ${busLinesContext.join("")}
          </div>
          <div>`
    );
    let marker = new Marker(element)
      .setLngLat([stop.lat, stop.lng])
      .setPopup(popup)
      .addTo(map);

    element.className = "marker";

    __markers.push(marker);

    return { ...stop };
  });
}

function clearAllMarkers() {
  while (__markers.length) {
    __markers.pop().remove();
  }
}

navigator.geolocation.watchPosition(
  ({ coords: { longitude: lng, latitude: lat } }) => {
    let range = 0.002985;

    nearestBusStops.busStops = findNearestBusStops(lng, lat, range).slice(0, 4);
    console.log(nearestBusStops.busStops.length);

    if (nearestBusStops.length === 4) return;

    switch (nearestBusStops.length) {
      case 0:
        range += 0.000325;
        break;
      default:
        range += 0.00015;
    }

    console.log(range, "new");
    nearestBusStops.busStops = findNearestBusStops(lng, lat, range).slice(0, 4);
  }
);

function calcDistance(start, end) {
  const R = 6371e3; // metres
  const φ1 = (start.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (end.lat * Math.PI) / 180;
  const Δφ = ((end.lat - start.lat) * Math.PI) / 180;
  const Δλ = ((end.lng - start.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

window.map = map;
window.calcDistance = calcDistance;
