// Query Selectors
const workouts = document.querySelector(".workouts");
const form = document.querySelector("form");
const distanceInput = document.querySelector(".form__input--distance");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTarget = document.querySelector(".form__input--target");

// Workout ARCHITECTURE
class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    const formattedDate = new Intl.DateTimeFormat(navigator.language, {
      month: "long",
      day: "numeric",
    }).format(this.date);

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on ${formattedDate}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cedence) {
    super(coords, distance, duration);
    this.cedence = cedence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Application ARCHITECTURE
class App {
  #map;
  #markerCoords;
  #workouts = [];

  constructor() {
    // ( Get user`s position )
    this._getPosition();

    // ( Get the user`s data and manip with it )
    form.addEventListener("submit", this._newWorkout.bind(this));

    // ( stitch b/t running, cycling )
    inputType.addEventListener("change", this._toggleElevationField.bind(this));

    // ( move to popup )
    workouts.addEventListener("click", this._scrollIntoView.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function (error) {
          alert("Error getting location..., Please reload the page");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  _loadMap(position) {
    // -> Get user`s coords
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    // -> Initialize the map
    // ^ Create a map instance and set its view to a given place and zoom level
    this.#map = L.map("map", {
      center: coords,
      zoom: 13,
    });

    // -> Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.#map);

    // -> Show the form on click in the map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(e) {
    // -> Get the clicked coords
    this.#markerCoords = e.latlng;

    // -> insert the form only if it doesn't exist & auto focus on distanceInput
    form.classList.remove("hidden");
    distanceInput.focus();
  }

  _hideForm() {
    // -> Empty the form inputs after submission
    inputDistance.value = inputDuration.value = inputTarget.value = "";

    // -> Hide the form
    form.classList.add("hidden");
  }

  _toggleElevationField(e) {
    const typeOfInputType = e.target.value;
    inputTarget.placeholder =
      typeOfInputType === "running" ? "steps/min" : "meters";
    inputTarget.name = typeOfInputType === "running" ? "cadence" : "Elev Gain";
    inputTarget.value = "";
    document.querySelector(".traget-label").textContent =
      typeOfInputType === "running" ? "cadence" : "Elev Gain";
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);
    // -> reset submit defaults
    e.preventDefault();

    // -> Get from data
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const target = +inputTarget.value;
    let workout;

    // -> Create running Object
    if (type === "running") {
      // -> Validation of correct inputs
      if (
        !validInputs(distance, duration, target) ||
        !allPositive(distance, duration, target)
      )
        return alert("Inputs should be positive numbers!");

      workout = new Running(this.#markerCoords, distance, duration, target);
    }

    // -> Create cycling Object
    if (type === "cycling") {
      // -> Validation of correct inputs
      if (
        !validInputs(distance, duration, target) ||
        !allPositive(distance, duration)
      )
        return alert("Inputs should be positive numbers!");

      workout = new Cycling(this.#markerCoords, distance, duration, target);
    }

    // -> Add new object to workout array
    this.#workouts.push(workout);

    // -> Render Workout Marker
    this._renderWorkoutMarker(workout);

    // -> Display Li
    this._renderWorkout(workout);

    // -> hide form
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    // -> Create popup
    const popup = L.popup({
      content: `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
        workout.description
      }`,
      autoClose: false,
      closeOnClick: false,
      className: `${workout.type}-popup`,
    }).setLatLng(workout.coords);

    // -> Display marker and its popup on the clicked position
    L.marker(workout.coords, {
      riseOnHover: true,
    })
      .addTo(this.#map)
      .bindPopup(popup)
      .openPopup();
  }

  _renderWorkout(workout) {
    // -> update the workouts ul with a new li with the data extracted from the form
    const html = `<li class="workout ${workout.type}" data-id= "${workout.id}">
        <h3>${workout.description}</h3>
        <div class="activities">
          <div class="activity">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
      workout.distance
    } <span>KM</span></div>
          <div class="activity">⏱ ${workout.duration} <span>MIN</span></div>
          <div class="activity">⚡️ ${
            workout.type === "running"
              ? workout.pace.toFixed(1)
              : workout.speed.toFixed(1)
          } <span>${workout.type === "running" ? "MIN/KM" : "KM/H"}</span></div>
          <div class="activity">${workout.type === "running" ? "🦶🏼" : "⛰"} ${
      workout.type === "running" ? workout.cedence : workout.elevationGain
    } <span>${workout.type === "running" ? "SPM" : "M"}</span></div>
        </div>
      </li>
          `;
    form.insertAdjacentHTML("afterend", html);
  }

  _scrollIntoView(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    // -> scroll to the map container
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    workout.click();
  }
}

const user = new App();
