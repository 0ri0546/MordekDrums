async function loadAccueilContent() {
  try {
    const response = await fetch('content/accueil/accueil.json');
    if (!response.ok) throw new Error('Erreur chargement JSON Accueil');
    const data = await response.json();

    document.querySelector('#accueil .title').textContent = data.title;
    document.querySelector('#accueil .description').textContent = data.description;

    const boutiqueLink = document.querySelector('.link-to-workshop-box');
    boutiqueLink.textContent = data.boutique.text;
    boutiqueLink.href = data.boutique.url;

    const materielLink = document.querySelector('.link-to-material-box');
    materielLink.textContent = data.materiel.text;
    materielLink.href = data.materiel.url;

  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', loadAccueilContent);
