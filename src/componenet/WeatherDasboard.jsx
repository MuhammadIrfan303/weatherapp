"use client"
import { useState, useEffect } from 'react';
import CurrentWeather from "./CurrentWeather";
import DailyForecast from "./DailyForecast";
import HourlyForecast from "./HourlyForecast";
import SearchBar from "./SearchBar";
import FavoriteLocations from "./FavouriteLocations";
import { getWeatherData, getForecastData, getWeatherDataByCoords, getForecastDataByCoords } from './weatherService';
import { FiSun, FiMoon, FiStar, FiMapPin, FiRefreshCw } from 'react-icons/fi';
// Add these imports at the top
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function WeatherDashboard() {
    const [darkMode, setDarkMode] = useState(true);
    const [city, setCity] = useState('Mumbai');
    const [favorites, setFavorites] = useState([]);
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    useEffect(() => {
        fetchWeatherData(city);
    }, [city]);
    useEffect(() => {
        const savedFavorites = localStorage.getItem('weatherFavorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);
    useEffect(() => {
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    }, [favorites]);

    // Add user state
    const [user, setUser] = useState(null);

    // Replace localStorage useEffects with Firebase sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch favorites from Firestore
                const fetchFavorites = async () => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                        if (userDoc.exists()) {
                            setFavorites(userDoc.data().favorites || []);
                        }
                    } catch (error) {
                        console.error('Error fetching favorites:', error);
                    }
                };
                fetchFavorites();
            }
        });

        return () => unsubscribe();
    }, []);

    // Update addToFavorites function
    const addToFavorites = async () => {
        if (!user) {
            setShowNotificationBanner(true);
            return;
        }

        if (!favorites.includes(city)) {
            const newFavorites = [...favorites, city];
            setFavorites(newFavorites);

            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    favorites: newFavorites
                });
            } catch (error) {
                console.error('Error updating favorites:', error);
                setError('Failed to save favorite location');
                setFavorites(favorites); // Revert on error
            }
        }
    };

    // Update toggleFavorite function
    const toggleFavorite = async (location) => {
        if (!user) {
            setShowNotificationBanner(true);
            return;
        }

        try {
            const newFavorites = favorites.includes(location)
                ? favorites.filter(fav => fav !== location)
                : [...favorites, location];

            setFavorites(newFavorites);

            await updateDoc(doc(db, 'users', user.uid), {
                favorites: newFavorites
            });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError('Failed to update favorite locations');
            setFavorites(favorites); // Revert on error
        }
    };

    const fetchWeatherData = async (cityName) => {
        try {
            setLoading(true);
            setError(null);
            const [weather, forecast] = await Promise.all([
                getWeatherData(cityName),
                getForecastData(cityName)
            ]);

            // Check if the API returned an error for invalid city
            if (weather.cod === '404' || forecast.cod === '404') {
                setError(`City "${cityName}" not found. Please check the spelling and try again.`);
                return;
            }

            setWeatherData(weather);
            setForecastData(forecast);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchCity) => {
        setCity(searchCity);
    };

    // const toggleFavorite = (location) => {
    //     if (favorites.includes(location)) {
    //         setFavorites(favorites.filter(fav => fav !== location));
    //     } else {
    //         setFavorites([...favorites, location]);
    //     }
    // };

    const refreshData = () => {
        fetchWeatherData(city);
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const [weather, forecast] = await Promise.all([
                        getWeatherDataByCoords(latitude, longitude),
                        getForecastDataByCoords(latitude, longitude)
                    ]);
                    setWeatherData(weather);
                    setForecastData(forecast);
                    setCity(weather.name);
                    setError(null);
                    setLastUpdated(new Date());
                } catch (err) {
                    setError('Failed to fetch weather data for your location');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setError('Please enable location access to get weather for your current location.');
                setLoading(false);
                console.error(error);
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);
    console.log('Current time in Karachi:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));

    // Add this state at the top with other state declarations
    const [showNotificationBanner, setShowNotificationBanner] = useState(true);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto p-4 md:p-6">
                {/* Notification Banner */}
                {showNotificationBanner && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'
                        }`}>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                                Get weather alerts for your favorite locations! Sign up to receive notifications.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                onClick={() => window.location.href = '/register'}
                            >
                                Sign Up
                            </button>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowNotificationBanner(false)}
                                aria-label="Close notification"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        <button
                            onClick={getCurrentLocation}
                            className={`p-2 rounded-full flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            <FiMapPin size={18} />
                            <span className="hidden md:inline">My Location</span>
                        </button>
                    </div>

                    <div className="w-full md:w-64">
                        <SearchBar onSearch={handleSearch} darkMode={darkMode} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {error && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} text-red-500`}>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <FavoriteLocations
                                    favorites={favorites}
                                    onSelect={handleSearch}
                                    onToggle={toggleFavorite}
                                    currentCity={city}
                                    darkMode={darkMode}
                                />
                                <button
                                    onClick={refreshData}
                                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    title="Refresh data"
                                >
                                    <FiRefreshCw size={18} />
                                </button>
                            </div>

                            <CurrentWeather
                                city={city}
                                weatherData={weatherData}
                                darkMode={darkMode}
                                lastUpdated={lastUpdated}
                            />

                            <button
                                onClick={addToFavorites}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                title="Add current city to favorites"
                            >
                                <FiStar />
                                <span>Save Location</span>
                            </button>

                            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                                <HourlyForecast
                                    city={city}
                                    forecastData={forecastData}
                                    darkMode={darkMode}
                                />
                            </div>

                            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow'}`}>
                                <DailyForecast
                                    city={city}
                                    forecastData={forecastData}
                                    darkMode={darkMode}
                                />
                            </div>

                            {lastUpdated && (
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                                    Last updated: {lastUpdated.toLocaleTimeString()} • Data provided by OpenWeather
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}