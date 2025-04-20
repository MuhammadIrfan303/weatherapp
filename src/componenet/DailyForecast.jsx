export default function DailyForecast({ forecastData, darkMode }) {
    if (!forecastData || !forecastData.list) return null;

    // Group data by day and pick the first entry for each day
    const groupedData = {};
    forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
        if (!groupedData[date]) {
            groupedData[date] = item;
        }
    });

    // Convert grouped data into an array and limit to 5 days
    const dailyData = Object.values(groupedData).slice(0, 5);

    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}.png`;
    };

    const formatDay = (timestamp) => {
        const today = new Date();
        const forecastDate = new Date(timestamp * 1000);

        if (forecastDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        return forecastDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">5-Day Forecast</h2>
            <div className="space-y-3">
                {dailyData.map((day, index) => (
                    <div
                        key={index}
                        className={`flex justify-between items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={getWeatherIcon(day.weather[0].icon)}
                                alt={day.weather[0].description}
                                className="w-10 h-10"
                            />
                            <div>
                                <span className="font-medium">{formatDay(day.dt)}</span>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {day.weather[0].description}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-medium">
                                    {Math.round(day.main.temp)}°
                                </span>
                                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <div>H: {Math.round(day.main.temp_max)}°</div>
                                    <div>L: {Math.round(day.main.temp_min)}°</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}