export default function FavoriteLocations({ favorites, onSelect, onToggle, currentCity }) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Favorite Locations</h3>
            <div className="flex flex-wrap gap-2">
                {favorites.map((location) => (
                    <div
                        key={location}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentCity === location
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-800/50 text-gray-200'
                            }`}
                    >
                        <button
                            onClick={() => onSelect(location)}
                            className="hover:text-white transition-colors"
                        >
                            {location}
                        </button>
                        <button
                            onClick={() => onToggle(location)}
                            className="ml-2 hover:text-red-500 transition-colors"
                            title="Remove from favorites"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}