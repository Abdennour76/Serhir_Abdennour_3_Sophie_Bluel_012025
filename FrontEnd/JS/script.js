const API_URL_PHOTOS = "http://localhost:5678/api/works";
const API_URL_CATEGORIES = "http://localhost:5678/api/categories";

async function loadPhotosAndFilters() {
  const gallery = document.querySelector(".gallery");
  const filtersContainer = document.querySelector(".filters");

  try {
    // Charger les catégories
    const categoriesResponse = await fetch(API_URL_CATEGORIES);
    if (!categoriesResponse.ok)
      throw new Error("Erreur lors de la récupération des catégories.");
    const categories = await categoriesResponse.json();

    // Ajouter le filtre "Tous" par défaut
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.dataset.category = "all";
    allButton.addEventListener("click", () => filterPhotos("all"));
    filtersContainer.appendChild(allButton);

    // Ajouter les filtres dynamiques
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.dataset.category = category.id; // Utiliser l'ID de la catégorie pour filtrer
      button.addEventListener("click", () => filterPhotos(category.id));
      filtersContainer.appendChild(button);
    });

    // Charger les photos
    const photosResponse = await fetch(API_URL_PHOTOS);
    if (!photosResponse.ok)
      throw new Error("Erreur lors de la récupération des photos.");
    const photos = await photosResponse.json();

    // Sauvegarder les photos dans une variable globale pour le filtrage
    window.allPhotos = photos;

    // Afficher toutes les photos par défaut
    displayPhotos(photos);
  } catch (error) {
    console.error("Erreur :", error);
    gallery.textContent = "Impossible de charger les données.";
  }
}

function displayPhotos(photos) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Efface la galerie existante

  photos.forEach((photo) => {
    if (!photo.imageUrl || !photo.title) {
      console.warn("Données manquantes pour la photo :", photo);
      return;
    }

    // Créer un conteneur pour chaque photo
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");

    // Attribuer les valeurs
    img.src = photo.imageUrl;
    img.alt = photo.title;
    caption.textContent = photo.title;

    // Ajouter les éléments au DOM
    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

function filterPhotos(categoryId) {
  const photos = window.allPhotos || [];
  if (categoryId === "all") {
    displayPhotos(photos);
  } else {
    const filteredPhotos = photos.filter(
      (photo) => photo.categoryId === categoryId
    );
    displayPhotos(filteredPhotos);
  }
}

// Charger les photos et les filtres lorsque le DOM est prêt
document.addEventListener("DOMContentLoaded", loadPhotosAndFilters);
