const API_URL_PHOTOS = "http://localhost:5678/api/works";

// Fonction pour vérifier si l'utilisateur est authentifié avant une action
function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return !!token; // Retourne true si un token est présent
}

// Fonction pour supprimer un travail sécurisé avec le token
async function deleteWork(workId) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Vous devez être connecté pour effectuer cette action.");
    window.location.href = "login.html"; // Redirige vers la page de connexion
    return;
  }

  try {
    const response = await fetch(`${API_URL_PHOTOS}/${workId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Ajout du token pour l'authentification
      },
    });

    if (response.ok) {
      alert("Travail supprimé avec succès !");
      // Mettre à jour la galerie ou d'autres éléments après suppression
      loadPhotosAndFilters();
    } else {
      alert("Échec de la suppression. Vérifiez vos autorisations.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
}

// Exemple d'usage : attacher une action à un bouton de suppression
document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const workId = button.dataset.workId; // Récupérer l'ID du travail
      deleteWork(workId);
    });
  });
});
