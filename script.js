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
