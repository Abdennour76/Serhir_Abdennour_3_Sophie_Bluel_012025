function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return !!token; // Retourne true si un token est présent
}

function logout() {
  localStorage.removeItem("authToken"); // Supprime le token
  window.location.href = "login.html"; // Redirige vers la page de login
}

// Transforme dynamiquement Login en Logout et affiche la barre "Mode édition"
document.addEventListener("DOMContentLoaded", function () {
  const loginLink = document.querySelector("nav a[href='login.html']");
  const editModeBar = document.getElementById("editModeBar");

  if (isAuthenticated()) {
    loginLink.textContent = "logout";
    loginLink.href = "#"; // Désactive la redirection

    // Afficher la barre Mode édition
    editModeBar.style.display = "block";

    loginLink.addEventListener("click", function (event) {
      event.preventDefault(); // Empêche l'action par défaut
      logout(); // Déconnecte l'utilisateur
    });
  } else {
    loginLink.textContent = "login";
    loginLink.href = "login.html"; // Redirige vers la page de connexion

    // Cacher la barre Mode édition
    editModeBar.style.display = "none";
  }
});
