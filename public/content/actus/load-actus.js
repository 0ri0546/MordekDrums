document.addEventListener('DOMContentLoaded', () => {
  fetch('content/actus/actus.json')
    .then(res => res.json())
    .then(data => {
      const boxes = document.querySelectorAll('.actus-box');

      data.forEach((item, index) => {
        const box = boxes[index];
        if (!box) return;

        const img = box.querySelector('img');
        if (img && item.image) {
          img.src = item.image;
          img.alt = item.title;
        }

        const h3 = box.querySelector('h3');
        if (h3) h3.textContent = item.title;

        const p = box.querySelector('p');
        if (p) p.textContent = item.text;
      });
    })
    .catch(err => {
      console.error("Erreur de chargement des actus :", err);
    });
});
