
import React, { useState } from 'react';

interface AuthPageProps {
    onLogin: (username: string, lat: number, lon: number) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [locationName, setLocationName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    // Geocode location name to coordinates
    const geocodeLocation = async (location: string): Promise<{ lat: number, lon: number } | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
                { headers: { 'User-Agent': 'WildfireIntel/1.0' } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (err) {
            console.error('Geocoding error:', err);
            return null;
        }
    };

    // Reverse geocode coordinates to location name
    const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                { headers: { 'User-Agent': 'WildfireIntel/1.0' } }
            );
            const data = await response.json();
            if (data && data.address) {
                return data.address.city || data.address.town || data.address.village || data.address.county || data.display_name.split(',')[0];
            }
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        } catch (err) {
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    };

    // Detect user's current location
    const detectLocation = () => {
        setDetectingLocation(true);
        setError('');

        if (!navigator.geolocation) {
            setDetectingLocation(false);
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Get location name from coordinates
                const locName = await reverseGeocode(lat, lon);
                setLocationName(locName);
                setDetectingLocation(false);

                // Auto-submit if name is already entered
                if (name.trim()) {
                    setLoading(true);
                    setTimeout(() => {
                        onLogin(name, lat, lon);
                        setLoading(false);
                    }, 500);
                }
            },
            (err) => {
                setDetectingLocation(false);
                setError('Location access denied. Please enter your location manually.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!locationName.trim()) {
            setError('Please enter your location or use "Detect My Location"');
            return;
        }

        setLoading(true);

        try {
            const coords = await geocodeLocation(locationName);

            if (!coords) {
                setError('Could not find that location. Try a city name like "Mumbai" or "New York"');
                setLoading(false);
                return;
            }

            onLogin(name, coords.lat, coords.lon);
        } catch (err) {
            setError('Failed to find location. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl border border-white/10 z-10 animate-fade-in relative mx-4">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Wildfire<span className="text-orange-500">Intel</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Get instant fire risk for your location</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Location</label>

                        {/* Auto-detect location button */}
                        <button
                            type="button"
                            onClick={detectLocation}
                            disabled={detectingLocation}
                            className="w-full mb-3 py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {detectingLocation ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Detecting Location...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    📍 Detect My Location
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <div className="flex-1 h-px bg-slate-700"></div>
                            <span>or type location</span>
                            <div className="flex-1 h-px bg-slate-700"></div>
                        </div>

                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="text"
                                value={locationName}
                                onChange={e => setLocationName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                placeholder="e.g. Mumbai, California, Sydney"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm p-3 rounded border bg-red-500/20 border-red-500/30 text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name || !locationName}
                        className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : '🔥 Get Fire Risk'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                        Powered by NASA FIRMS & AI Analysis
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
