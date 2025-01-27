
// Fonction pour ajouter un marqueur sur la carte
export function addMarker(map, markers, lat, lng, title) {
    console.log(map);
    if (!map) {
        console.error("La carte n'est pas initialisée. Appelez initMap() d'abord.");
        return;
    }

    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: title,
    });

    // Ajouter le marqueur au tableau pour garder une trace
    markers.push(marker);
    console.log("Marqueur ajouté :", { lat, lng, title });
}

// Fonction pour récupérer la géolocalisation en utilisant une Promise
export async function getGeolocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                resolve({ lat: latitude, lng: longitude });
            },
            (err) => {
                console.error(`ERROR(${err.code}): ${err.message}`);
                reject(err);
            },
            options
        );
    });
}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};
