document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("openModal");
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
  const photoPreview = document.querySelector(".photo-input-placeholder");
  const photoTitle = document.getElementById("photoTitle");
  const photoCategory = document.getElementById("photoCategory");
  const submitButton = addPhotoForm.querySelector("button[type='submit']");

  const API_URL_CATEGORIES = "http://localhost:5678/api/categories";
  const API_URL_PHOTOS = "http://localhost:5678/api/works";

  // Vérifier si l'utilisateur est connecté et afficher ou masquer le bouton Modifier
  if (!isAuthenticated()) {
    openModalBtn.style.display = "none"; // Masquer le bouton si l'utilisateur n'est pas connecté
  } else {
    openModalBtn.style.display = "inline-block"; // Afficher le bouton si l'utilisateur est connecté
  }

  // Ouvrir la modale en cliquant sur le bouton Modifier
  openModalBtn.addEventListener("click", function () {
    if (!isAuthenticated()) {
      alert("Vous devez être connecté pour accéder à cette section.");
      window.location.href = "login.html"; // Rediriger vers la page de connexion
      return;
    }

    modal.style.display = "flex";
    loadPhotos(); // Charger les photos existantes
  });

  // Fermer la modale
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm(); // Réinitialiser le formulaire
  });

  // Fermer la modale en cliquant à l'extérieur
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      resetForm(); // Réinitialiser le formulaire
    }
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
        figure.dataset.id = photo.id; // Ajouter l'ID pour la suppression
        figure.style.position = "relative";

        const img = document.createElement("img");
        img.src = photo.imageUrl;
        img.alt = photo.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener("click", () => deletePhoto(photo.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        photoGallery.appendChild(figure);
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
        // Supprimer l'élément du DOM dans la modale
        const photoElement = document.querySelector(
          `figure[data-id="${photoId}"]`
        );
        if (photoElement) {
          photoElement.remove();
        }

        // Mettre à jour la galerie principale
        window.allPhotos = window.allPhotos.filter(
          (photo) => photo.id !== photoId
        );
        displayPhotos(window.allPhotos); // Réactualiser la galerie principale
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur s'est produite lors de la suppression.");
    }
  }

  // Activer ou désactiver le bouton Valider en fonction des champs remplis
  function updateSubmitButtonState() {
    if (
      photoInput.files.length > 0 &&
      photoTitle.value.trim() !== "" &&
      photoCategory.value !== ""
    ) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#1d6154";
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#ccc";
    }
  }

  // Ajouter des événements d'entrée pour vérifier les champs
  photoInput.addEventListener("change", updateSubmitButtonState);
  photoTitle.addEventListener("input", updateSubmitButtonState);
  photoCategory.addEventListener("change", updateSubmitButtonState);

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
        const newPhoto = await response.json();
        resetForm();

        // Ajouter la nouvelle photo directement au DOM de la modale
        const figure = document.createElement("figure");
        figure.dataset.id = newPhoto.id;
        figure.style.position = "relative";

        const img = document.createElement("img");
        img.src = newPhoto.imageUrl;
        img.alt = newPhoto.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener("click", () => deletePhoto(newPhoto.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        photoGallery.appendChild(figure);

        // Mettre à jour la galerie principale
        window.allPhotos.push(newPhoto); // Ajouter aux données globales
        displayPhotos(window.allPhotos); // Réactualiser la galerie principale

        // Retourner à la galerie
        addPhotoSection.style.display = "none";
        photoGallerySection.style.display = "block";
      } else {
        alert("Erreur lors de l'ajout de la photo.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur s'est produite lors de l'ajout.");
    }
  });

  // Charger les catégories
  async function loadCategories() {
    try {
      const response = await fetch(API_URL_CATEGORIES);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des catégories.");
      const categories = await response.json();

      // Remplir le champ des catégories
      photoCategory.innerHTML = '<option value=""></option>';
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

  // Prévisualiser la photo ajoutée dans le placeholder
  photoInput.addEventListener("change", function () {
    const file = photoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // Remplacer le contenu de l'élément photoPreview par l'image sélectionnée
        photoPreview.innerHTML = `<img src="${e.target.result}" alt="Photo ajoutée">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Réinitialiser le formulaire
  function resetForm() {
    addPhotoForm.reset();
    photoPreview.innerHTML = `
      <i class="fa-solid fa-image"></i>
      <span>+ Ajouter photo</span>
      <p>jpg, png : 4mo max</p>
    `;
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "#ccc";
    addPhotoSection.style.display = "none";
    photoGallerySection.style.display = "block";
  }

  // Initialiser l'état du bouton Valider
  updateSubmitButtonState();
});
