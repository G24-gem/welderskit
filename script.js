window.addEventListener("load", () => {
  // First: detect device width and toggle views
  if (window.innerWidth < 768) {
    document.querySelector(".mobile-content").style.display = "block";
    document.querySelector(".desktop-message").style.display = "none";
  } else {
    document.querySelector(".mobile-content").style.display = "none";
    document.querySelector(".desktop-message").style.display = "block";
  }

  // Then: handle intro logic only for mobile
  if (window.innerWidth < 768) {
    if (sessionStorage.getItem("introPlayed")) {
      // Skip intro if already viewed this session
      window.location.href = "page.html";
    } else {
      sessionStorage.setItem("introPlayed", "true");

      // Listen for animation end on the text
      const text = document.getElementById("text-home");
      if (text) {
        text.addEventListener("animationend", () => {
          // Extra hold time after animation
          const holdTime = 2000; // 2s
          setTimeout(() => {
            window.location.href = "page.html";
          }, holdTime);
        });
      }
    }
  }
});
