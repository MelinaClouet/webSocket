export function initMap(ws) {
    if (!window.google || !google.maps) {
        console.error("Google Maps API non chargée. Vérifiez votre clé API.");
        return;
    }

    const defaultCoord = { lat: 49.200737416622665, lng: -0.34995824975933315 };

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultCoord,
        zoom: 7,
        mapId: "1ae4a27839cc1f80",
    });

    getUserLocalisation()
        .then((position) => {
            const userCoord = { lat: position.lat, lng: position.lng };
            map.setCenter(userCoord);
            new google.maps.Marker({
                position: userCoord,
                map: map,
                title: "Votre position actuelle",
            });
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération de la position utilisateur :", error);
        });
}

export function updateMarkers(positions) {
    if (!Array.isArray(positions)) {
        console.error("Positions reçues au mauvais format :", positions);
        return;
    }

    const connectedEmails = new Set(positions.map((p) => p.email));
    markers.forEach((marker, email) => {
        if (!connectedEmails.has(email)) {
            marker.setMap(null);
            markers.delete(email);
        }
    });

    positions.forEach((position) => {
        if (!position.email || !position.latitude || !position.longitude) {
            console.warn("Position invalide ignorée :", position);
            return;
        }

        const latLng = new google.maps.LatLng(position.latitude, position.longitude);

        if (markers.has(position.email)) {
            markers.get(position.email).setPosition(latLng);
        } else {
            const marker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: position.name,
                label: position.name.charAt(0),
            });
            markers.set(position.email, marker);
        }
    });
}