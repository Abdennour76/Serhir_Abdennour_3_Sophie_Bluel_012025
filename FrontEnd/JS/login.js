document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    // Clear previous error message
    errorMessage.textContent = "";

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        if (token) {
          // Stocker le token pour les actions authentifiées
          localStorage.setItem("authToken", token);

          window.location.href = "index.html"; // Redirection vers la page d'accueil
        } else {
          errorMessage.textContent = "Impossible de récupérer le token.";
        }
      } else if (response.status === 401) {
        errorMessage.textContent = "E-mail ou mot de passe incorrect.";
      } else if (response.status === 404) {
        errorMessage.textContent = "Endpoint non trouvé (erreur 404).";
      } else {
        errorMessage.textContent =
          "Une erreur est survenue. Veuillez réessayer.";
      }
    } catch (error) {
      errorMessage.textContent = "Erreur de connexion au serveur.";
    }
  });
