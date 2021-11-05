import "./core/index.js";
import "https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js";
import "https://cdn.jsdelivr.net/npm/mapbox-gl@2.5";
import { findNearestBusStops } from "./lib/busStops.js";
import { busLineColor } from "./lib/busLines.js";
import { km } from "./core/fomula.js";

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

const nearestBusStops = new Vue({
  el: "#nearest-bus-stops",
  data: {
    hidden: false,
    bottomSheet: "translate-y-60",
    busStops: [],
  },
  methods: {
    busLineColor,
    toggleBottomSheet() {
      if (this.hidden) {
        this.bottomSheet = "translate-y-60";
        return;
      }
      this.bottomSheet = this.busStops.length
        ? "translate-y-0"
        : "translate-y-60";
    },
    watchNearestBusStops({ lat, lng }) {
      let range = km(1);
      let busStops = findNearestBusStops(lng, lat, range);
      this.busStops = busStops.slice(0, 4);
      this.toggleBottomSheet();
    },
    hideNearestBusStops() {
      this.hidden = !this.hidden;
      this.toggleBottomSheet();
    },
  },
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

window.addEventListener("load", () =>
  document
    .querySelector("button.mapboxgl-ctrl-geolocate")
    .addEventListener("click", () =>
      navigator.geolocation.watchPosition(({ coords }) =>
        nearestBusStops.watchNearestBusStops({
          lat: coords.latitude,
          lng: coords.longitude,
        })
      )
    )
);

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
