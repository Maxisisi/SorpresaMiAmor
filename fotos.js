const photos = Array.isArray(window.PHOTO_ITEMS) ? window.PHOTO_ITEMS : [];
const timeline = document.querySelector("#photo-timeline");
const count = document.querySelector("#photo-count");
const viewer = document.querySelector("#photo-viewer");
const viewerImage = viewer?.querySelector(".photo-viewer-frame img");
const viewerDate = document.querySelector("#photo-viewer-date");
const closeViewerButton = viewer?.querySelector(".photo-viewer-close");
const prevButton = viewer?.querySelector(".photo-viewer-prev");
const nextButton = viewer?.querySelector(".photo-viewer-next");
let activePhotoIndex = 0;

const groupedPhotos = photos.reduce((groups, photo) => {
  if (!groups.has(photo.dateKey)) {
    groups.set(photo.dateKey, []);
  }

  groups.get(photo.dateKey).push(photo);
  return groups;
}, new Map());

if (count) {
  count.textContent = `${photos.length} fotos encontradas en la carpeta Nosotros`;
}

if (timeline) {
  timeline.innerHTML = "";

  groupedPhotos.forEach((items) => {
    const day = document.createElement("article");
    day.className = "photo-day reveal";

    const heading = document.createElement("div");
    heading.className = "photo-day-heading";
    heading.innerHTML = `
      <span>${items[0].dateLabel}</span>
      <strong>${items.length} ${items.length === 1 ? "foto" : "fotos"}</strong>
    `;

    const grid = document.createElement("div");
    grid.className = "photo-grid";

    items.forEach((photo) => {
      const photoIndex = photos.indexOf(photo);
      const card = document.createElement("button");
      card.className = "photo-card";
      card.type = "button";
      card.dataset.photoIndex = photoIndex.toString();
      card.setAttribute("aria-label", `Ver foto del ${photo.dateLabel}`);
      card.innerHTML = `
        <img src="${photo.src}" alt="${photo.name}" loading="lazy" />
      `;

      grid.appendChild(card);
    });

    day.append(heading, grid);
    timeline.appendChild(day);
  });
}

function showPhoto(index) {
  if (!viewer || !viewerImage || !viewerDate || !photos[index]) {
    return;
  }

  activePhotoIndex = index;
  const photo = photos[activePhotoIndex];

  viewerImage.classList.add("is-changing");

  window.setTimeout(() => {
    viewerImage.src = photo.src;
    viewerImage.alt = `Foto del ${photo.dateLabel}`;
    viewerDate.textContent = photo.dateLabel;
    viewerImage.classList.remove("is-changing");
  }, 120);

  viewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
}

function closePhotoViewer() {
  if (!viewer) {
    return;
  }

  viewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
}

function movePhoto(direction) {
  const nextIndex = (activePhotoIndex + direction + photos.length) % photos.length;
  showPhoto(nextIndex);
}

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    showPhoto(Number(card.dataset.photoIndex));
  });
});

closeViewerButton?.addEventListener("click", closePhotoViewer);
prevButton?.addEventListener("click", () => movePhoto(-1));
nextButton?.addEventListener("click", () => movePhoto(1));

viewer?.addEventListener("click", (event) => {
  if (event.target === viewer) {
    closePhotoViewer();
  }
});

document.addEventListener("keydown", (event) => {
  if (!viewer || viewer.getAttribute("aria-hidden") === "true") {
    return;
  }

  if (event.key === "Escape") {
    closePhotoViewer();
  }

  if (event.key === "ArrowLeft") {
    movePhoto(-1);
  }

  if (event.key === "ArrowRight") {
    movePhoto(1);
  }
});
