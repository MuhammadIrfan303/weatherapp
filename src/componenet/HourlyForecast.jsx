"use client"
import { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function HourlyForecast({ forecastData, darkMode }) {
    if (!forecastData || !forecastData.list) return null;

    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const hourlyData = forecastData.list.slice(0, 12);

    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            hour12: true
        }).replace(' ', '');
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="space-y-4 relative">
            <h2 className="text-xl font-semibold">Hourly Forecast</h2>

            <div className="relative">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow-md`}
                        aria-label="Scroll left"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto pb-2 -mx-2 scrollbar-hide"
                    onScroll={handleScroll}
                >
                    {hourlyData.map((hour, index) => (
                        <div
                            key={index}
                            className={`flex-shrink-0 w-24 p-3 rounded-lg mx-2 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                        >
                            <div className="text-center space-y-2">
                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {index === 0 ? 'Now' : formatTime(hour.dt)}
                                </div>
                                <img
                                    src={getWeatherIcon(hour.weather[0].icon)}
                                    alt={hour.weather[0].description}
                                    className="w-12 h-12 mx-auto"
                                />
                                <div className="text-lg font-medium">
                                    {Math.round(hour.main.temp)}°
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {hour.weather[0].description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} shadow-md`}
                        aria-label="Scroll right"
                    >
                        <FiChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}