const workouts = document.querySelector(".workouts");
const form = document.querySelector("form");
const distanceInput = document.querySelector(".form__input--distance");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTarget = document.querySelector(".form__input--target");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  static workoutsArray = [];

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cedence) {
    super(coords, distance, duration);
    this.cedence = cedence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
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

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));

    // todo stitch b/t running, cycling
    inputType.addEventListener("change", this._toggleElevationField.bind(this));
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
    const typeOfInputType = e.target.value;
    const target = document.querySelector(`.form__input--target`);
    target.placeholder = typeOfInputType === "running" ? "steps/min" : "meters";
    target.name = typeOfInputType === "running" ? "cadence" : "Elev Gain";
    document.querySelector(".traget-label").textContent =
      typeOfInputType === "running" ? "cadence" : "Elev Gain";
  }

  _newWorkout(e) {
    e.preventDefault();

    const data = new FormData(form);

    const type = data.get("type");
    const distance = data.get("distance");
    const duration = data.get("duration");
    const target = data.get(type === "running" ? "cadence" : "Elev Gain");

    // todo Validate the inputs
    if (
      isNaN(Number(distance)) ||
      isNaN(Number(duration)) ||
      isNaN(Number(target))
    ) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(date);

    const popup = L.popup({
      content: `${type} on ${formattedDate}`,
      autoClose: false,
      closeOnClick: false,
      className: type === "running" ? "running-popup" : "cycling-popup",
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

    if (type === "running") {
      const newRunningObj = new Running(
        this.#markerCoords,
        distance,
        duration,
        target
      );
      Workout.workoutsArray.push(newRunningObj);
      console.log(Workout.workoutsArray);
    } else {
      const newCyclingObj = new Cycling(
        this.#markerCoords,
        distance,
        duration,
        target
      );
      Workout.workoutsArray.push(newCyclingObj);
      console.log(Workout.workoutsArray);
    }

    // todo delete the form after submission
    inputDistance.value = inputDuration.value = inputTarget.value = "";

    form.classList.add("hidden");

    // todo update the workouts ul with a new li with the data extracted from the form
    // document.querySelector("ul").addEventListener(
    //   "click",
    //   function (e) {
    //     const workoutEl = e.target.closest(".workout");
    //     if (!workoutEl) return;
    //     const coordsArr = JSON.parse(workoutEl.dataset.coords);

    //     // todo scroll to the map container
    //     this.#map.panTo(coordsArr, {
    //       animate: true,
    //       duration: 1, // in seconds
    //     });
    //     //
    //   }
    //     .bind(this)
    //     .bind(this)
    // );

    // workouts.insertAdjacentHTML(
    //   "afterbegin",
    //   `<li class="workout ${this.#type}" data-coords= "${JSON.stringify([
    //     this.#coords.lat,
    //     this.#coords.lng,
    //   ])}">
    //     <h3>${this.#type} on ${formattedDate}</h3>
    //     <div class="activities">
    //       <div class="activity">${this.#type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
    //     this.#distance
    //   } <span>KM</span></div>
    //       <div class="activity">⏱ ${this.#duration} <span>MIN</span></div>
    //       <div class="activity">⚡️ ${this.#pace} <span>MIN/KM</span></div>
    //       <div class="activity">${this.#type === "running" ? "🦶🏼" : "⛰"} ${
    //     this.#target
    //   } <span>SPM</span></div>
    //     </div>
    //   </li>
    //       `
    // );
  }
}

const user = new App();
