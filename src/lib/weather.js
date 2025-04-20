import fetch from 'node-fetch';

export const getWeatherData = async (city) => {
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    console.log(API_KEY);
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
    }

    return response.json();
};
