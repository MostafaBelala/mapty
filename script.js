const workouts = document.querySelector(".workouts");

// ! Get the user's current location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const coords = [latitude, longitude];

      // -> Initialize the map
      // ^ Create a map instance and set its view to a given place and zoom level
      const map = L.map("map", {
        center: coords,
        zoom: 13,
        //   zoomControl: true, // Show +/- zoom buttons
        //   scrollWheelZoom: true, // Disable scroll to zoom
        // doubleClickZoom: true, // Disable double-click zoom
        //   dragging: true, // Enable dragging
        //   boxZoom: true, // Enable box zoom (Shift + drag)
        // touchZoom: true, // Enable pinch zoom on mobile
        //   keyboard: true, // Enable keyboard navigation
      });
      // -> Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // -> marker mechanism
      const markerMechanism = function () {
        // todo Get the clcked coordinates

        map.on("click", function (e) {
          const coords = e.latlng;

          // todo insert the form only if it doesn't exist
          if (!document.querySelector(".form")) {
            const html = `
              <form action="" class="form">
                <div class="form__row">
                  <label class="form__label">type</label>
                  <select id="type" class="form__input form__input--type" name="type">
                    <option value="running">running</option>
                    <option value="cycling">cycling</option>
                  </select>
                </div>
                <div class="form__row">
                  <label class="form__label">distance</label>
                  <input
                    type="text"
                    name="distance"
                    class="form__input form__input--distance"
                    placeholder="km"
                    required
                  />
                </div>
                <div class="form__row">
                  <label class="form__label">duration</label>
                  <input
                    type="text"
                    name="duration"
                    class="form__input form__input--duration"
                    placeholder="min"
                    required
                  />
                </div>
                <div class="form__row">
                  <label class="form__label traget-label">cadence</label>
                  <input
                    type="text"
                    name="cadence"
                    class="form__input form__input--target"
                    placeholder="steps/min"
                    required
                  />
                </div>
                  <button type="submit" style="display: none;">Send</button>
              </form>`;

            workouts.insertAdjacentHTML("afterbegin", html);

            document.querySelector(".form__input--distance").focus();

            // todo stitch b/t running, cycling
            document
              .querySelector("select")
              .addEventListener("change", function (e) {
                type = e.target.value;
                const target = document.querySelector(`.form__input--target`);
                target.placeholder =
                  type === "running" ? "steps/min" : "meters";
                target.name = type === "running" ? "cadence" : "Elev Gain";
                document.querySelector(".traget-label").textContent =
                  type === "running" ? "cadence" : "Elev Gain";
              });

            document
              .querySelector(".form")
              .addEventListener("submit", function (e) {
                e.preventDefault();

                const data = new FormData(this);
                const type = data.get("type");
                const distance = data.get("distance");
                const duration = data.get("duration");
                const target = data.get(
                  type === "running" ? "cadence" : "Elev Gain"
                );

                // todo Validate the inputs
                if (
                  isNaN(Number(distance)) ||
                  isNaN(Number(duration)) ||
                  isNaN(Number(target))
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
                  content: `${type} on ${formattedDate}`,
                  autoClose: false,
                  closeOnClick: false,
                  className:
                    type === "running" ? "running-popup" : "cycling-popup",
                })
                  .setLatLng(coords)
                  .openOn(map);

                // todo Create a marker at the clicked position
                L.marker(coords, {
                  riseOnHover: true,
                })
                  .addTo(map)
                  .bindPopup(popup)
                  .openPopup();

                // todo delete the form after submission
                document.querySelector(".form").remove();

                // todo update the workouts ul with a new li with the data extracted from the form
                workouts.insertAdjacentHTML(
                  "afterbegin",
                  `<li class="workout ${type}" data-coords= "${JSON.stringify([
                    coords.lat,
                    coords.lng,
                  ])}">
                    <h3>${type} on ${formattedDate}</h3>
                    <div class="activities">
                      <div class="activity">${
                        type === "running" ? "🏃‍♂️" : "🚴‍♀️"
                      } ${distance} <span>KM</span></div>
                      <div class="activity">⏱ ${duration} <span>MIN</span></div>
                      <div class="activity">⚡️ ${distance} <span>MIN/KM</span></div>
                      <div class="activity">${
                        type === "running" ? "🦶🏼" : "⛰"
                      } ${target} <span>SPM</span></div>
                    </div>
                  </li>
                  `
                );
              });

            document
              .querySelector("ul")
              .addEventListener("click", function (e) {
                const workoutEl = e.target.closest(".workout");
                if (!workoutEl) return;
                const coordsArr = JSON.parse(workoutEl.dataset.coords);

                // todo scroll to the map container
                map.panTo(coordsArr, {
                  animate: true,
                  duration: 1, // in seconds
                });
                //
              });
          }
        });
      };
      markerMechanism();
    },
    function (error) {
      console.error("Error getting location:", error);
    }
  );
} else {
  console.log("Geolocation is not supported by this browser.");
}

// ! Polygon example
// ^ Define a polygon with an array of latlngs
// var latlngs = [
//   [37, -109.05],
//   [41, -109.03],
//   [41, -102.05],
//   [37, -102.04],
// ];

// var polygon = L.polygon(latlngs, { color: "red" }).addTo(map);

// // zoom the map to the polygon
// map.fitBounds(polygon.getBounds());

// ! event listeners
// ^ Add a click event listener to the map
// map.on("click", function (e) {
//   const coords = e.latlng;
//   L.marker(e.latlng).addTo(map).bindPopup("Runing on Jule 20").openPopup();
// });
