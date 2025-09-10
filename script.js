window.addEventListener("load", () => {
  if (window.innerWidth < 768) {
    // Show mobile content, hide desktop message
    document.querySelector(".mobile-content").style.display = "block";
    document.querySelector(".desktop-message").style.display = "none";

    // Only redirect if not yet marked as played in this visit
    if (!sessionStorage.getItem("introPlayed")) {
      sessionStorage.setItem("introPlayed", "true");

      const text = document.getElementById("text-home");

      // Fallback redirect (e.g. 5 seconds after load, even if animation fails)
      const fallbackTimer = setTimeout(() => {
        window.location.href = "page.html";
      }, 5000);

      if (text) {
        text.addEventListener("animationend", () => {
          clearTimeout(fallbackTimer); // cancel fallback
          const holdTime = 2000; // extra time after animation
          setTimeout(() => {
            window.location.href = "page.html";
          }, holdTime);
        });
      }
    }
    // If introPlayed already set → do nothing (let them stay on index.html)
  } else {
    // Desktop case
    document.querySelector(".mobile-content").style.display = "none";
    document.querySelector(".desktop-message").style.display = "block";
  }
});

