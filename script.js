// Show loading spinner
function showLoading(show) {
  document.getElementById('loading').style.display = show ? "block" : "none";
}

// Fetch weather by city name
async function getWeatherByCity() {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert("Please enter a city name!");
    return;
  }
  showLoading(true);

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results) {
      document.getElementById('weather').innerHTML = "❌ City not found!";
      showLoading(false);
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    fetchWeather(latitude, longitude, `${name}, ${country}`);
  } catch (error) {
    document.getElementById('weather').innerHTML = "⚠️ Error fetching data.";
    showLoading(false);
  }
}

// Fetch weather by location
function getWeatherByLocation() {
  if (navigator.geolocation) {
    showLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
      },
      () => {
        alert("Location access denied.");
        showLoading(false);
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

// Fetch weather details
async function fetchWeather(lat, lon, locationName) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();

    const weather = data.current_weather;

    // Choose weather icon
    const icons = {
      0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️", 45: "🌫", 48: "🌫",
      51: "🌦", 61: "🌧", 71: "❄️", 95: "⛈"
    };
    const weatherIcon = icons[weather.weathercode] || "🌍";

    document.getElementById('weather').innerHTML = `
      <h3>📍 ${locationName}</h3>
      <p style="font-size: 40px">${weatherIcon}</p>
      <p>🌡 Temperature: ${weather.temperature} °C</p>
      <p>💨 Wind Speed: ${weather.windspeed} km/h</p>
      <p>⏰ Time: ${weather.time}</p>
    `;
  } catch (error) {
    document.getElementById('weather').innerHTML = "⚠️ Unable to fetch weather.";
  } finally {
    showLoading(false);
  }
}
