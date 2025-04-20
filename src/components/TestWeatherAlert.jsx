'use client'
import { useState } from 'react';

const TestWeatherAlert = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const testAlert = async () => {
        if (!userEmail) {
            setStatus('Error: Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/sendmessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    favorites: ['Bahawalpur', 'Lahore']
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            setStatus(`Success: ${data.message}`);
        } catch (error) {
            console.error('Error:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-2 border rounded mb-2 text-gray-800"
                />
            </div>
            <button
                onClick={testAlert}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {loading ? 'Sending...' : 'Test Weather Alert'}
            </button>
            {status && (
                <p className={`mt-4 ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {status}
                </p>
            )}
        </div>
    );
};

export default TestWeatherAlert;