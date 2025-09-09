window.addEventListener("load", () => {
  if (window.innerWidth < 768) {
    document.querySelector(".mobile-content").style.display = "block";
    document.querySelector(".desktop-message").style.display = "none";
  } else {
    document.querySelector(".mobile-content").style.display = "none";
    document.querySelector(".desktop-message").style.display = "block";
  }

  if (window.innerWidth < 768) {
    // Only redirect if not yet marked as played in this visit
    if (!sessionStorage.getItem("introPlayed")) {
      sessionStorage.setItem("introPlayed", "true");

      // Wait for animation then redirect
      const text = document.getElementById("text-home");
      if (text) {
        text.addEventListener("animationend", () => {
          const holdTime = 2000; // extra time after animation
          setTimeout(() => {
            window.location.href = "page.html";
          }, holdTime);
        });
      }
    }
    // If introPlayed already set → do nothing (let them stay on index.html)
  }
});

navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;
  console.log("User Location:", userLat, userLng);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}


 var shops = [
      { name: "Powerline Iron Works", lat: 6.6215, lng: 3.3221 },
      { name: "Agege Welding Supplies", lat: 6.6150, lng: 3.3250 },
      { name: "Ikeja Metal Store", lat: 6.6018, lng: 3.3515 },
      { name: "Ojota Building Materials", lat: 6.5765, lng: 3.3792 }
    ];

    // Initialize map (Lagos center by default)
    var map = L.map('map').setView([6.5244, 3.3792], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Function to calculate distance between 2 coords (km)
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Center map on user
        map.setView([userLat, userLng], 14);

        // Add marker for user
        L.marker([userLat, userLng]).addTo(map).bindPopup("You are here").openPopup();

        // Show only shops within 3km
        shops.forEach(shop => {
          const distance = getDistance(userLat, userLng, shop.lat, shop.lng);
          if (distance <= 3) {
            L.marker([shop.lat, shop.lng])
              .addTo(map)
              .bindPopup(`${shop.name} <br> (${distance.toFixed(1)} km away)`);
          }
        });

      }, err => {
        alert("Location access denied. Cannot show nearby shops.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
