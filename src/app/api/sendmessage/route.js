import { NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/weather';
import nodemailer from 'nodemailer';
export async function POST(request) {

    try {
        const { email, favorites } = await request.json();

        if (!email || !favorites || !Array.isArray(favorites)) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD  // Changed from EMAIL_PASS to EMAIL_PASSWORD
            }
        });
        let alertMessage = `Good morning! Here's your daily weather update:\n\n`;
        // Use Promise.all with proper error handling
        const weatherResults = await Promise.all(
            favorites.map(city =>
                getWeatherData(city)
                    .catch(error => ({ error: `Failed to fetch weather for ${city}` }))
            )
        );

        let hasValidData = false;
        weatherResults.forEach((data, index) => {
            if (!data.error && data.cod === 200) {
                hasValidData = true;
                alertMessage += `${favorites[index]}: ${data.main.temp}°C, ${data.weather[0].description}\n`;
                if (data.main.temp > 35) {
                    alertMessage += `⚠️ High temperature alert!\n`;
                } else if (data.main.temp < 5) {
                    alertMessage += `⚠️ Low temperature alert!\n`;
                }
                if (data.weather[0].main === 'Rain') {
                    alertMessage += `🌧️ Rain expected - carry an umbrella!\n`;
                }
            }
        });

        if (!hasValidData) {
            return NextResponse.json(
                { error: 'No valid weather data available' },
                { status: 500 }
            );
        }

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Daily Weather Alert',
            text: alertMessage
        });

        return NextResponse.json({
            message: 'Weather alerts sent successfully',
            preview: alertMessage
        });
    } catch (error) {
        console.error('Error sending weather alerts:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send weather alerts' },
            { status: 500 }
        );
    }
}