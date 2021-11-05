import "./core/index.js";
import "https://cdn.jsdelivr.net/npm/vue@2.6/dist/vue.js";
import { busLines } from "./lib/busLines.js";
import { busStops, findNearestBusStops } from "./lib/busStops.js";

const videoPlaylists = [
  {
    title: "Squid Game Season 2 - Trailer",
    src:
      "https://firebasestorage.googleapis.com/v0/b/warr-tee.appspot.com/o/squid-game-season-2-trailer.mp4?alt=media&token=fec548da-7dc1-4144-a283-7bae952376c3",
  },
  {
    title: "Hellbound - Trailer | Netflix",
    src:
      "https://firebasestorage.googleapis.com/v0/b/warr-tee.appspot.com/o/hellbound-trailer.mp4?alt=media&token=cbfe7fc8-edab-4ba6-b6f8-9d9f92d1d129",
  },
];

// busStops.filter(({ bus_ids }) => bus_ids.includes("11"))

const app = new Vue({
  el: "main",
  data: {
    video: null,
    videos: videoPlaylists,
    currentStop: {},
    nextStop: {},
    lineDetails: busLines.find(({ bus_id }) => bus_id == 11),
    stops: [],
  },
  computed: {
    lineNo() {
      return this.lineDetails.bus_id.toBurmeseString();
    },
  },
  methods: {
    generateId(input) {
      return btoa(encodeURIComponent(input)).toLowerCase();
    },
    scrollIntoView() {
      let id = this.generateId(
        this.currentStop.name + this.currentStop.lat + this.currentStop.lng
      );
      let el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    },
  },
  beforeMount() {
    this.stops = this.lineDetails.bus_stops.map((bus_stop_name) =>
      busStops.find(
        ({ bus_ids, name }) =>
          bus_ids.includes("11") && name.trim().includes(bus_stop_name.trim())
      )
    );
  },
  mounted() {
    this.video = this.videos.shift();
    requestAnimationFrame(() => {
      let player = this.$refs.player;
      player.addEventListener("ended", () => {
        let video = this.videos.shift();
        if (video) {
          this.video = video;
        } else {
          this.videos = videoPlaylists;
          this.mounted();
        }
      });
    });
  },
});

navigator.geolocation.watchPosition(({ coords: { latitude, longitude } }) => {
  let nearest = findNearestBusStops(
    longitude,
    latitude,
    0.5,
    app.stops
  ).filter(({ bus_ids }) =>
    bus_ids.includes(app.lineDetails.bus_id.toString())
  );

  if (nearest.length) {
    app.currentStop = nearest[0] || {};
    app.nextStop = nearest[1] || {};
    app.scrollIntoView();
  }
});
