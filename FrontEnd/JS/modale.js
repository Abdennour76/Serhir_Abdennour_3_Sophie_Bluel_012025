document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("openModal"); // Bouton Modifier à côté de Mes Projets
  const closeModalBtn = modal.querySelector(".close");
  const photoGallerySection = document.getElementById("photoGallerySection");
  const addPhotoSection = document.getElementById("addPhotoSection");
  const openAddPhotoFormBtn = document.getElementById("openAddPhotoForm");
  const backToGalleryBtn = document.createElement("button");
  backToGalleryBtn.className = "back-to-gallery";
  backToGalleryBtn.innerHTML = "<i class='fa-solid fa-arrow-left'></i>";
  addPhotoSection.prepend(backToGalleryBtn);

  const photoGallery = document.getElementById("photoGallery");
  const addPhotoForm = document.getElementById("addPhotoForm");
  const photoInput = document.getElementById("photoInput");
  const photoTitle = document.getElementById("photoTitle");
  const photoCategory = document.getElementById("photoCategory");

  const API_URL_CATEGORIES = "http://localhost:5678/api/categories";
  const API_URL_PHOTOS = "http://localhost:5678/api/works";

  // Ouvrir la modale en cliquant sur le bouton Modifier
  openModalBtn.addEventListener("click", function () {
    modal.style.display = "flex";
    loadPhotos(); // Charger les photos existantes
  });

  // Fermer la modale
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm(); // Réinitialiser le formulaire
  });

  // Ouvrir le formulaire d'ajout
  openAddPhotoFormBtn.addEventListener("click", () => {
    photoGallerySection.style.display = "none";
    addPhotoSection.style.display = "block";
    loadCategories(); // Charger les catégories dynamiquement
  });

  // Retourner à la galerie depuis la fenêtre Ajout Photo
  backToGalleryBtn.addEventListener("click", () => {
    addPhotoSection.style.display = "none";
    photoGallerySection.style.display = "block";
  });

  // Charger les photos existantes
  async function loadPhotos() {
    try {
      const response = await fetch(API_URL_PHOTOS);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des photos.");
      const photos = await response.json();

      photoGallery.innerHTML = ""; // Vider la galerie avant de charger
      photos.forEach((photo) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = photo.imageUrl;
        img.alt = photo.title;

        // Ajouter uniquement l'image au conteneur
        figure.appendChild(img);
        photoGallery.appendChild(figure);
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Charger les catégories
  async function loadCategories() {
    try {
      const response = await fetch(API_URL_CATEGORIES);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des catégories.");
      const categories = await response.json();

      // Remplir le champ des catégories
      photoCategory.innerHTML =
        '<option value="">Sélectionnez une catégorie</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        photoCategory.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Supprimer une photo
  async function deletePhoto(photoId) {
    try {
      const response = await fetch(`${API_URL_PHOTOS}/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        alert("Photo supprimée avec succès !");
        loadPhotos();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Soumettre le formulaire d'ajout
  addPhotoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", photoInput.files[0]);
    formData.append("title", photoTitle.value);
    formData.append("category", photoCategory.value);

    try {
      const response = await fetch(API_URL_PHOTOS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Photo ajoutée avec succès !");
        resetForm();
        // Basculer à la galerie
        addPhotoSection.style.display = "none";
        photoGallerySection.style.display = "block";
      } else {
        alert("Erreur lors de l'ajout de la photo.");
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Réinitialiser le formulaire
  function resetForm() {
    addPhotoForm.reset();
    addPhotoSection.style.display = "none";
    photoGallerySection.style.display = "block";
  }
});
