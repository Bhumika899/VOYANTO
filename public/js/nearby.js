const nearbyBtn = document.getElementById("nearbyFilter");

if (nearbyBtn) {
    nearbyBtn.addEventListener("click", () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                window.location.href =
                    `/listings/nearby?lat=${lat}&lng=${lng}`;
            },
            () => {
                alert("Please allow location access");
            }
        );
    });
}