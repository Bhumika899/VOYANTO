document.addEventListener("DOMContentLoaded", () => {
    if (!window.mapData) return;

    const { lat, lng, location } = window.mapData;

    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(map);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(location)
        .openPopup();
});