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


 // Center map on Lagos
    var map = L.map('map').setView([6.5244, 3.3792], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Example shops in Lagos (replace with your own list)
    var shops = [
      { name: "Alaba International Market", lat: 6.4919, lng: 3.1896 },
      { name: "Ojota Building Materials", lat: 6.5765, lng: 3.3792 },
      { name: "Mushin Welding Supplies", lat: 6.5375, lng: 3.3500 },
      { name: "Ladipo Auto & Metal Market", lat: 6.5386, lng: 3.3616 }
    ];

    // Add markers for each shop
    shops.forEach(shop => {
      L.marker([shop.lat, shop.lng])
        .addTo(map)
        .bindPopup(shop.name);
    });
