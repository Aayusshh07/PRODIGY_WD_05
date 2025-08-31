const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key
let forecastData = []; // store forecast for details

// Get weather by city
async function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city name!");

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetchWeather(weatherUrl);
  fetchForecast(forecastUrl);
}

// Get weather by location
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation not supported by your browser.");
  }

  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetchWeather(weatherUrl);
    fetchForecast(forecastUrl);
  }

  function error() {
    alert("Unable to retrieve your location.");
  }
}

// Fetch current weather
async function fetchWeather(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    document.getElementById("weatherInfo").innerHTML = `<p>${error.message}</p>`;
  }
}

// Show current weather
function displayWeather(data) {
  const weatherInfo = document.getElementById("weatherInfo");
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherInfo.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="${icon}" alt="Weather icon">
    <p><b>🌡 Temperature:</b> ${data.main.temp}°C</p>
    <p><b>☁ Condition:</b> ${data.weather[0].description}</p>
    <p><b>💧 Humidity:</b> ${data.main.humidity}%</p>
    <p><b>🌬 Wind Speed:</b> ${data.wind.speed} m/s</p>
  `;

  // Backgrounds
  const condition = data.weather[0].main.toLowerCase();
  if (condition.includes("clear")) {
    document.body.style.background = "linear-gradient(to right, #56ccf2, #2f80ed)";
  } else if (condition.includes("cloud")) {
    document.body.style.background = "linear-gradient(to right, #757f9a, #d7dde8)";
  } else if (condition.includes("rain")) {
    document.body.style.background = "linear-gradient(to right, #00c6fb, #005bea)";
  } else if (condition.includes("snow")) {
    document.body.style.background = "linear-gradient(to right, #e0eafc, #cfdef3)";
  } else if (condition.includes("thunderstorm")) {
    document.body.style.background = "linear-gradient(to right, #141E30, #243B55)";
  } else {
    document.body.style.background = "linear-gradient(to right, #74ebd5, #ACB6E5)";
  }
}

// Fetch forecast
async function fetchForecast(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");
    const data = await response.json();
    forecastData = data.list; // store all forecast data
    displayForecast(data);
  } catch (error) {
    document.getElementById("forecast").innerHTML = `<p>${error.message}</p>`;
  }
}

// Show 5-day forecast
function displayForecast(data) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";
  document.getElementById("forecastTitle").style.display = "block";

  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = date.toLocaleDateString(undefined, options);
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <h4>${dateStr}</h4>
      <img src="${icon}" alt="Weather icon">
      <p>${day.main.temp}°C</p>
      <p>${day.weather[0].main}</p>
    `;

    // click event for details
    div.onclick = () => showDetails(date);
    forecastDiv.appendChild(div);
  });
}

// Show hourly details in modal
function showDetails(selectedDate) {
  const detailsBox = document.getElementById("detailsBox");
  const overlay = document.getElementById("overlay");
  const detailsContent = document.getElementById("detailsContent");
  detailsContent.innerHTML = "";

  const dayData = forecastData.filter(item =>
    new Date(item.dt_txt).toDateString() === selectedDate.toDateString()
  );

  dayData.forEach(hour => {
    const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`;

    detailsContent.innerHTML += `
      <p><b>${time}</b> - ${hour.main.temp}°C, ${hour.weather[0].description} 
      <img src="${icon}" width="30"></p>
    `;
  });

  document.getElementById("detailsTitle").innerText =
    "Hourly Forecast for " + selectedDate.toDateString();

  overlay.style.display = "block";
  detailsBox.style.display = "block";
}

// Close modal
function closeDetails() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("detailsBox").style.display = "none";
}
