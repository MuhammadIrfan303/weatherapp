const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export async function getWeatherData(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

export async function getForecastData(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw error;
    }
}

// ... existing code ...

export async function getWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

export async function getForecastDataByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw error;
    }
}