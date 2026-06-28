export interface WeatherTheme {
    backgroundImage: string;
    overlay: string;
    title: string;
    subtitle: string;
}

export function getWeatherTheme(condition: string): WeatherTheme {

    const weather = condition.toLowerCase();

    // ☀ SUNNY
    if (weather.includes("sunny") || weather.includes("clear")) {
        return {
            backgroundImage:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80",

            overlay:
                "linear-gradient(to right, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.1) 100%)",

            title:
                "Perfect weather for cycling.",

            subtitle:
                "Clear skies and comfortable conditions."
        };
    }

    // ☁ CLOUDY
    if (
        weather.includes("cloud") ||
        weather.includes("overcast")
    ) {
        return {
            backgroundImage:
                "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&q=80",

            overlay:
                "linear-gradient(to right, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0.15) 100%)",

            title:
                "Cloudy skies, enjoy your ride.",

            subtitle:
                "Comfortable weather for cycling."
        };
    }

    // 🌧 RAIN
    if (
        weather.includes("rain") ||
        weather.includes("drizzle")
    ) {
        return {
            backgroundImage:
                "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1600&q=80",

            overlay:
                "linear-gradient(to right, rgba(20,20,20,.70) 45%, rgba(20,20,20,.20) 100%)",

            title:
                "Rain expected, ride carefully.",

            subtitle:
                "Roads may become slippery."
        };
    }

    // ⛈ THUNDER
    if (
        weather.includes("thunder")
    ) {
        return {
            backgroundImage:
                "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1600&q=80",

            overlay:
                "linear-gradient(to right, rgba(0,0,0,.75) 45%, rgba(0,0,0,.30) 100%)",

            title:
                "Thunderstorm detected.",

            subtitle:
                "Consider postponing your ride."
        };
    }

    // 🌫 DEFAULT
    return {
        backgroundImage:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",

        overlay:
            "linear-gradient(to right, rgba(255,255,255,.9) 45%, transparent 80%)",

        title:
            "Prepare for your ride.",

        subtitle:
            "Stay safe and enjoy cycling."
    };
}