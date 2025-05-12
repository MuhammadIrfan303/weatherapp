const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

// ✅ Initialize Firebase Admin SDK
try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://your-firebase-project.firebaseio.com"
    });
    console.log("✅ Firebase initialized successfully");
} catch (err) {
    console.error("❌ Firebase initialization failed:", err);
    process.exit(1);
}

// ✅ Function to get weather data (OpenWeather API)
async function getWeatherData(city) {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// ✅ Main function to send daily alerts
async function sendDailyAlerts() {
    // 1) Create transporter with debug turned on
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,    // must be App-Password if you have 2FA
        },
        debug: true,
        logger: true
    });

    // 2) Verify SMTP connection configuration
    try {
        await transporter.verify();
        console.log('✅ SMTP server is ready to take our messages');
    } catch (err) {
        console.error('❌ SMTP configuration error:', err);
        process.exit(1);
    }

    // 3) Load users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    console.log(`✅ Found ${usersSnapshot.size} users in Firestore`);

    for (const userDoc of usersSnapshot.docs) {
        const { email: userEmail, favorites = [] } = userDoc.data();
        console.log(`User ${userEmail} has ${favorites.length} favorite locations`);

        if (favorites.length === 0) {
            continue;
        }

        // 4) Fetch all weather data in parallel
        const weatherResults = await Promise.all(
            favorites.map(city =>
                getWeatherData(city).catch(err => ({ error: err.message }))
            )
        );

        // 5) Build the message
        let alertMessage = `Good morning! Here's your daily weather update:\n\n`;
        weatherResults.forEach((data, i) => {
            const city = favorites[i];
            if (data.error) {
                alertMessage += `${city}: couldn’t fetch weather (${data.error})\n\n`;
            } else if (data.cod !== 200) {
                alertMessage += `${city}: API returned code ${data.cod}\n\n`;
            } else {
                alertMessage += `${city}:\n`
                    + `Temperature: ${data.main.temp}°C\n`
                    + `Conditions: ${data.weather[0].description}\n`;
                if (data.main.temp > 35) alertMessage += `⚠️ High temperature alert!\n`;
                if (data.main.temp < 5) alertMessage += `⚠️ Low temperature alert!\n`;
                if (data.weather[0].main === 'Rain') alertMessage += `🌧️ Rain expected—carry an umbrella!\n`;
                alertMessage += `\n`;
            }
        });

        // 6) Send each mail in its own try/catch
        try {
            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Your Daily Weather Alert',
                text: alertMessage,
            });
            console.log(`✉️  Sent to ${userEmail}: messageId=${info.messageId}`);
        } catch (mailErr) {
            console.error(`❌ Failed to send to ${userEmail}:`, mailErr);
        }
    }
}

// ✅ Execute the main function
sendDailyAlerts().catch(err => {
    console.error("❌ Error in sendDailyAlerts:", err);
    process.exit(1);
});
