// ---------- DOM elements ----------
const stateInput = document.getElementById("state-input");
const fetchButton = document.getElementById("fetch-alerts");
const alertsDisplay = document.getElementById("alerts-display");
const errorMessage = document.getElementById("error-message");

// ---------- Error helpers ----------
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

// ---------- Fetch ----------
async function fetchWeatherAlerts(state) {
  try {
    // Empty input
    if (!state) {
      throw new Error("Please enter a state abbreviation.");
    }

    // Wrong format (must be exactly 2 letters, like MN)
    if (!/^[A-Z]{2}$/.test(state)) {
      throw new Error("State must be a 2-letter abbreviation, like MN.");
    }

    const response = await fetch(
      `https://api.weather.gov/alerts/active?area=${state}`
    );

    // fetch doesn't throw on 400/404/500, so we check manually
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(`"${state}" is not a valid state abbreviation.`);
      }
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const data = await response.json();

    // Success: hide any old error, then show the new data
    hideError();
    displayAlerts(data);
  } catch (error) {
    // Covers empty input, bad state code, HTTP errors, and network failures
    alertsDisplay.textContent = ""; // don't leave old alerts next to an error
    showError(error.message);
  }
}

// ---------- Display ----------
function displayAlerts(data) {
  // Remove anything from a previous search
  alertsDisplay.textContent = "";

  const alerts = data.features;

  // Summary message
  const summary = document.createElement("p");
  summary.textContent = `${data.title}: ${alerts.length}`;
  alertsDisplay.appendChild(summary);

  // List of headlines
  const list = document.createElement("ul");

  alerts.forEach((alert) => {
    const item = document.createElement("li");
    item.textContent = alert.properties.headline;
    list.appendChild(item);
  });

  alertsDisplay.appendChild(list);
}

// ---------- Events ----------
fetchButton.addEventListener("click", () => {
  const state = stateInput.value.trim().toUpperCase();

  // Clear the input field on every fetch
  stateInput.value = "";

  fetchWeatherAlerts(state);
});