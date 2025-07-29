const workouts = document.querySelector(".workouts");
const form = document.querySelector("form");
const distanceInput = document.querySelector(".form__input--distance");
const selectInput = document.querySelector(".form__input--type");

class App {
  #map;
  #coords;
  #markerCoords;
  #type;
  #distance;
  #duration;
  #target;

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));

    // todo stitch b/t running, cycling
    selectInput.addEventListener(
      "change",
      this._toggleElevationField.bind(this)
    );
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (error) {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    this.#coords = [latitude, longitude];

    // -> Initialize the map
    // ^ Create a map instance and set its view to a given place and zoom level
    this.#map = L.map("map", {
      center: this.#coords,
      zoom: 13,
    });

    // -> Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(e) {
    // todo Get the clcked coordinates
    this.#markerCoords = e.latlng;

    // todo insert the form only if it doesn't exist
    form.classList.remove("hidden");
    distanceInput.focus();
  }

  _toggleElevationField(e) {
    this.#type = e.target.value;
    const target = document.querySelector(`.form__input--target`);
    target.placeholder = type === "running" ? "steps/min" : "meters";
    target.name = type === "running" ? "cadence" : "Elev Gain";
    document.querySelector(".traget-label").textContent =
      type === "running" ? "cadence" : "Elev Gain";
  }

  _newWorkout(e) {
    e.preventDefault();

    const data = new FormData(form);

    this.#type = data.get("type");
    this.#distance = data.get("distance");
    this.#duration = data.get("duration");
    this.#target = data.get(this.#type === "running" ? "cadence" : "Elev Gain");

    // todo Validate the inputs
    if (
      isNaN(Number(this.#distance)) ||
      isNaN(Number(this.#duration)) ||
      isNaN(Number(this.#target))
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    // todo add a leaflet with title formatted with current date (month day)
    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(date);

    const popup = L.popup({
      content: `${this.#type} on ${formattedDate}`,
      autoClose: false,
      closeOnClick: false,
      className: this.#type === "running" ? "running-popup" : "cycling-popup",
    })
      .setLatLng(this.#markerCoords)
      .openOn(this.#map);

    // todo Create a marker at the clicked position
    L.marker(this.#markerCoords, {
      riseOnHover: true,
    })
      .addTo(this.#map)
      .bindPopup(popup)
      .openPopup();

    // todo delete the form after submission
    document.querySelector(".form").remove();

    // todo update the workouts ul with a new li with the data extracted from the form
    document.querySelector("ul").addEventListener(
      "click",
      function (e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) return;
        const coordsArr = JSON.parse(workoutEl.dataset.coords);

        // todo scroll to the map container
        this.#map.panTo(coordsArr, {
          animate: true,
          duration: 1, // in seconds
        });
        //
      }
        .bind(this)
        .bind(this)
    );

    workouts.insertAdjacentHTML(
      "afterbegin",
      `<li class="workout ${this.#type}" data-coords= "${JSON.stringify([
        this.#coords.lat,
        this.#coords.lng,
      ])}">
        <h3>${this.#type} on ${formattedDate}</h3>
        <div class="activities">
          <div class="activity">${this.#type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
        this.#distance
      } <span>KM</span></div>
          <div class="activity">⏱ ${this.#duration} <span>MIN</span></div>
          <div class="activity">⚡️ ${this.#distance} <span>MIN/KM</span></div>
          <div class="activity">${this.#type === "running" ? "🦶🏼" : "⛰"} ${
        this.#target
      } <span>SPM</span></div>
        </div>
      </li>
          `
    );
  }
}

const user = new App();
