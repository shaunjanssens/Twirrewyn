import { useEffect, useState } from "react";
import { fetchWeatherApi } from "openmeteo";

const LATITUDE = 51.5483;
const LONGITUDE = 3.6667;
const API_URL = "https://api.open-meteo.com/v1/forecast";

function degToCompass(num: number) {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return arr[val % 16];
}

export default function Weather() {
  const [weather, setWeather] = useState<{
    current: {
      temperature: number;
      windSpeed: number;
      windDirection: number;
      windGusts: number;
    };
    hourly: {
      time: Date[];
      temperature: number[];
      windSpeed: number[];
      windDirection: number[];
      windGusts: number[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getWeather() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          latitude: [LATITUDE],
          longitude: [LONGITUDE],
          current:
            "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
          hourly:
            "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
          timezone: "auto",
          wind_speed_unit: "kn",
        };
        const responses = await fetchWeatherApi(API_URL, params);
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const current = response.current();
        const hourly = response.hourly();
        if (!current || !hourly) {
          setError("Weather data is unavailable.");
          setLoading(false);
          return;
        }
        const range = (start: number, stop: number, step: number) =>
          Array.from(
            { length: (stop - start) / step },
            (_, i) => start + i * step
          );
        const hourlyTimes = range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000));
        setWeather({
          current: {
            temperature: current.variables(0)?.value() ?? 0,
            windSpeed: current.variables(1)?.value() ?? 0,
            windDirection: current.variables(2)?.value() ?? 0,
            windGusts: current.variables(3)?.value() ?? 0,
          },
          hourly: {
            time: hourlyTimes,
            temperature: Array.from(hourly.variables(0)?.valuesArray() || []),
            windSpeed: Array.from(hourly.variables(1)?.valuesArray() || []),
            windDirection: Array.from(hourly.variables(2)?.valuesArray() || []),
            windGusts: Array.from(hourly.variables(3)?.valuesArray() || []),
          },
        });
      } catch {
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
      }
    }
    getWeather();
  }, []);

  if (loading) return <div className="weather-card">Loading weather...</div>;
  if (error) return <div className="weather-card weather-error">{error}</div>;
  if (!weather) return null;

  return (
    <div className="weather-card">
      <h2>Huidige weersvoorspelling</h2>
      <div className="weather-current">
        <div className="weather-row">
          <span className="weather-label">Temperatuur:</span>
          <span className="weather-value">
            {Math.round(weather.current.temperature * 10) / 10}°C
          </span>
        </div>
        <div className="weather-row">
          <span className="weather-label">Wind:</span>
          <span className="weather-value">
            {Math.round(weather.current.windSpeed * 10) / 10} kn{" "}
            {degToCompass(weather.current.windDirection)} (
            {weather.current.windDirection}°)
            <span
              className="wind-arrow"
              style={{
                display: "inline-block",
                marginLeft: 8,
                verticalAlign: "middle",
                transform: `rotate(${weather.current.windDirection}deg)`,
              }}
              title={`Wind direction: ${weather.current.windDirection}°`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                style={{ display: "inline" }}
              >
                <path
                  d="M12 2 L12 22 M12 2 L8 8 M12 2 L16 8"
                  stroke="#3498db"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </div>
        <div className="weather-row">
          <span className="weather-label">Gusts:</span>
          <span className="weather-value">
            {Math.round(weather.current.windGusts * 10) / 10} kn
          </span>
        </div>
      </div>
      <h3>Volgende 12 uur</h3>
      <div className="weather-hourly scroll-x">
        {(() => {
          const now = new Date();
          const firstIdx = weather.hourly.time.findIndex((t) => t > now);
          const startIdx = firstIdx === -1 ? 0 : firstIdx;
          return weather.hourly.time
            .slice(startIdx, startIdx + 12)
            .map((time: Date, i: number) => (
              <div className="weather-hour" key={i}>
                <div className="weather-hour-time">{time.getHours()}:00</div>
                <div className="weather-hour-temp">
                  {weather.hourly.temperature[i]?.toFixed(1)}°C
                </div>
                <div className="weather-hour-wind">
                  {Math.round(weather.hourly.windSpeed[i] * 10) / 10} kn{" "}
                  {degToCompass(weather.hourly.windDirection[i])}
                  <span
                    className="wind-arrow"
                    style={{
                      display: "inline-block",
                      marginLeft: 6,
                      verticalAlign: "middle",
                      transform: `rotate(${weather.hourly.windDirection[i]}deg)`,
                    }}
                    title={`Wind direction: ${weather.hourly.windDirection[i]}°`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      style={{ display: "inline" }}
                    >
                      <path
                        d="M12 2 L12 22 M12 2 L8 8 M12 2 L16 8"
                        stroke="#3498db"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="weather-hour-gusts">
                  Gusts: {Math.round(weather.hourly.windGusts[i] * 10) / 10} kn
                </div>
              </div>
            ));
        })()}
      </div>
    </div>
  );
}
