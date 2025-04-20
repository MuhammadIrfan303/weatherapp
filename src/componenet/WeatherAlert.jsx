import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const WeatherAlert = ({ user, darkMode }) => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!user) return;

        const alertsRef = collection(db, 'weatherAlerts');
        const alertsQuery = query(alertsRef, where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
            const newAlerts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            })).sort((a, b) => b.timestamp - a.timestamp);

            setAlerts(newAlerts);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-4">
            {alerts.map(alert => (
                <div 
                    key={alert.id}
                    className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg border-l-4 ${
                        alert.type === 'warning' ? 'border-yellow-500' : 
                        alert.type === 'danger' ? 'border-red-500' : 
                        'border-blue-500'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">{alert.location}</h3>
                            <p className="text-sm mt-1">{alert.message}</p>
                            <p className="text-xs mt-2 text-gray-500">
                                {alert.timestamp?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            {alerts.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                    No weather alerts at this time
                </p>
            )}
        </div>
    );
};

export default WeatherAlert;