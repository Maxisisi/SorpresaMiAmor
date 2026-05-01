const revealed = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealed.forEach((element) => observer.observe(element));

document.querySelectorAll(".gallery").forEach((gallery) => {
  const mainImage = gallery.querySelector(".gallery-main img");
  const buttons = gallery.querySelectorAll(".gallery-thumbs button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextSrc = button.dataset.gallerySrc;

      if (!nextSrc || mainImage.getAttribute("src") === nextSrc) {
        return;
      }

      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      mainImage.classList.add("is-changing");

      window.setTimeout(() => {
        mainImage.setAttribute("src", nextSrc);
        mainImage.classList.remove("is-changing");
      }, 180);
    });
  });
});
