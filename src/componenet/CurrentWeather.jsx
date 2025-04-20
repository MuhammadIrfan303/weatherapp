export default function CurrentWeather({ weatherData, darkMode, lastUpdated }) {
    if (!weatherData) return null;

    const {
        name,
        main: { temp, feels_like, humidity, pressure, temp_max, temp_min },
        sys: { sunrise, sunset },
        weather: [{ main: description, icon }],
        wind: { speed: windSpeed },
        visibility
    } = weatherData;

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {currentDate} • {currentTime}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <img
                            src={getWeatherIcon(icon)}
                            alt={description}
                            className="w-16 h-16"
                        />
                        <div>
                            <div className="text-5xl font-bold">{Math.round(temp)}°C</div>
                            <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {description}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Feels Like</p>
                        <p className="text-xl font-semibold">{Math.round(feels_like)}°C</p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Humidity</p>
                        <p className="text-xl font-semibold">{humidity}%</p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Wind</p>
                        <p className="text-xl font-semibold">{windSpeed} m/s</p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visibility</p>
                        <p className="text-xl font-semibold">{visibility / 1000} km</p>
                    </div>
                </div>
            </div>

            <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sunrise</p>
                        <p className="text-lg">{formatTime(sunrise)}</p>
                    </div>
                    <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sunset</p>
                        <p className="text-lg">{formatTime(sunset)}</p>
                    </div>
                    <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>High</p>
                        <p className="text-lg">{Math.round(temp_max)}°C</p>
                    </div>
                    <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low</p>
                        <p className="text-lg">{Math.round(temp_min)}°C</p>
                    </div>
                </div>
            </div>
        </div>
    );
}