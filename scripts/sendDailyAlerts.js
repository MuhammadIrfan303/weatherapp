const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG))
});

const db = admin.firestore();

async function getWeatherData(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    return response.json();
}

async function sendDailyAlerts() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        // Get all users from Firestore
        const usersSnapshot = await db.collection('users').get();

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userEmail = userData.email;
            const favorites = userData.favorites || [];

            if (favorites.length > 0) {
                // Get weather for all favorite locations
                const weatherPromises = favorites.map(city => getWeatherData(city));
                const weatherResults = await Promise.all(weatherPromises);

                let alertMessage = `Good morning! Here's your daily weather update:\n\n`;

                weatherResults.forEach((data, index) => {
                    if (data.cod === 200) {
                        alertMessage += `${favorites[index]}:\n`;
                        alertMessage += `Temperature: ${data.main.temp}°C\n`;
                        alertMessage += `Conditions: ${data.weather[0].description}\n`;

                        if (data.main.temp > 35) {
                            alertMessage += `⚠️ High temperature alert!\n`;
                        } else if (data.main.temp < 5) {
                            alertMessage += `⚠️ Low temperature alert!\n`;
                        }

                        if (data.weather[0].main === 'Rain') {
                            alertMessage += `🌧️ Rain expected - carry an umbrella!\n`;
                        }
                        alertMessage += `\n`;
                    }
                });

                // Send email to user
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: 'Your Daily Weather Alert',
                    text: alertMessage
                });

                console.log(`Alert sent to ${userEmail}`);
            }
        }
    } catch (error) {
        console.error('Error sending alerts:', error);
    }
}

sendDailyAlerts();