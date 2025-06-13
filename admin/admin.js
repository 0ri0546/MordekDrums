async function loadJson() {
    const section = document.getElementById('section-select').value;
    const res = await fetch(`/admin/json/${section}`);
    if (res.ok) {
        const data = await res.json();
        document.getElementById('json-editor').value = JSON.stringify(data, null, 2);
    } else {
        alert('Erreur de chargement');
    }
}

async function saveJson(event) {
    event.preventDefault();
    const section = document.getElementById('section-select').value;
    const text = document.getElementById('json-editor').value;

    try {
        const parsed = JSON.parse(text);
        const res = await fetch(`/admin/json/${section}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
        });
        document.getElementById('status').innerText = await res.text();
    } catch (e) {
        alert('JSON invalide !');
    }
}

//-----aperçu images dispo--------
async function loadImages() {
    try {
        const res = await fetch('/list-images');
        const files = await res.json();

        const gallery = document.getElementById('image-gallery');
        gallery.innerHTML = '';
        gallery.style.display = 'flex';
        gallery.style.flexWrap = 'wrap';
        gallery.style.justifyContent = 'center';

        files.forEach(file => {
            const container = document.createElement('div');
            container.style.textAlign = 'center';
            container.style.marginBottom = '20px';
            container.style.margin = '10px 20px';

            const img = document.createElement('img');
            img.src = `/assets/${file}`;
            img.alt = file;
            img.style.width = '100px';
            img.style.border = '1px solid #ccc';
            img.style.borderRadius = '6px';

            const label = document.createElement('div');
            label.textContent = file;
            label.style.fontSize = '14px';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Nouveau nom...';
            input.style.marginTop = '5px';
            input.style.display = 'block';
            input.style.fontSize = '14px';
            input.style.width = '100%';
            input.style.padding = '2px';

            const renameBtn = document.createElement('button');
            renameBtn.textContent = '✏️ Renommer';
            renameBtn.style.fontSize = '14px';
            renameBtn.onclick = () => {
                const newName = input.value.trim();
                if (newName && newName !== file) {
                    const ext = file.split('.').pop();
                    const finalName = newName.endsWith(`.${ext}`) ? newName : `${newName}.${ext}`;
                    renameImage(file, finalName);
                } else {
                    alert("Nom invalide ou identique.");
                }
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑 Supprimer';
            deleteBtn.style.fontSize = '14px';
            deleteBtn.onclick = () => {
                if (confirm(`Supprimer l'image "${file}" ?`)) {
                    deleteImage(file);
                }
            };

            label.textContent = file;
            label.style.fontSize = '14px';
            label.style.cursor = 'pointer';
            label.style.position = 'relative'; 
            label.onclick = () => {
                navigator.clipboard.writeText(file).then(() => {
                    const bubble = document.createElement('div');
                    bubble.textContent = '✅ Copié';
                    bubble.style.position = 'absolute';
                    bubble.style.top = '-20px';
                    bubble.style.left = '50%';
                    bubble.style.transform = 'translateX(-50%)';
                    bubble.style.backgroundColor = '#333';
                    bubble.style.color = 'white';
                    bubble.style.padding = '2px 6px';
                    bubble.style.fontSize = '14px';
                    bubble.style.borderRadius = '4px';
                    bubble.style.zIndex = '10';
                    bubble.style.opacity = '0';
                    bubble.style.transition = 'opacity 0.3s';

                    label.appendChild(bubble);

                    void bubble.offsetWidth;
                    bubble.style.opacity = '1';

                    setTimeout(() => {
                        bubble.style.opacity = '0';
                        setTimeout(() => bubble.remove(), 300);
                    }, 3000);
                });
            };

            container.appendChild(img);
            container.appendChild(label);
            container.appendChild(input);
            container.appendChild(renameBtn);
            container.appendChild(deleteBtn);
            gallery.appendChild(container);
        });

    } catch (err) {
        console.error('Erreur chargement images :', err);
    }
}

async function deleteImage(filename) {
    try {
        const res = await fetch(`/delete-image/${filename}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Image supprimée !');
            loadImages();
        } else {
            alert('Erreur lors de la suppression.');
        }
    } catch (err) {
        console.error('Erreur suppression :', err);
        alert('Erreur serveur.');
    }
}

document.getElementById('refresh-images').addEventListener('click', () => {
    loadImages();
});

window.addEventListener('DOMContentLoaded', () => {
    loadImages();
    document.getElementById('refresh-images').addEventListener('click', () => {
        loadImages();
    });
});

async function renameImage(oldName, newName) {
    try {
        const res = await fetch(`/rename-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName, newName })
        });
        if (res.ok) {
            alert('✅ Image renommée avec succès');
            loadImages();
        } else {
            const err = await res.text();
            alert('Erreur : ' + err);
        }
    } catch (err) {
        alert('Erreur serveur.');
        console.error(err);
    }
}
//-----aperçu images dispo--------

const examples = {
  accueil: `{
  "title": "MordekDrums", 
  "description": "Je suis Mordek, batteur professionnel et créateur de contenu. Sur scène ou en stream, je repousse les limites de la batterie en l’intégrant à l’univers du gaming. Entre performances live et gameplay contrôlé à la batterie, Mordek Drums, c’est un projet unique où musique et jeux vidéo ne font plus qu’un. Bienvenue dans mon univers !",
  "boutique": {
    "text": "Boutique",
    "url": "https://eliminate.fr/partner/mordekdrums/"
  },
  "materiel": {
    "text": "Matériel utilisé",
    "url": "https://www.thomann.fr/thlpg_o3buxpx5j8.html"
  }
}`,
  actus: `{
    "title": "Lancement d'un nouveau concept !",
    "text": "En ce moment, une game par jour, avec des nouveaux invités.",
    "image": "assets/background.webp"
  },
  {
    "title": "15000 followers atteints !",
    "text": "Merci pour votre confiance et votre soutien continu.",
    "image": "assets/background.webp"
  },
  {
    "title": "Je test un nouveau jeu !",
    "text": "Ce soir live un peu particulier, exclusive sur Twitch, on test dune awakening :). Sûrement pas à la batterie :).",
    "image": "assets/background.webp"
  }`,
  esport: `{
    "position": "top-left",
    "link": "https://fortnitetracker.com/profile/all/MKD%20Grim",
    "image": "assets/playerOne.webp"
  },
  {
    "position": "middle-left",
    "link": "https://fortnitetracker.com/profile/all/MKD-ONI",
    "image": "assets/playerTwo.webp"
  },
  {
    "position": "bottom-left",
    "link": "#",
    "image": "assets/playerThree.webp"
  },
  {
    "position": "top-right",
    "link": "#",
    "image": "assets/playerOne.webp"
  },
  {
    "position": "middle-right",
    "link": "#",
    "image": "assets/playerOne.webp"
  },
  {
    "position": "bottom-right",
    "link": "#",
    "image": "assets/playerOne.webp"
  },
  {
    "position": "center-photo",
    "link": "https://fortnitetracker.com/profile/all/MordekDrums",
    "image": "assets/playerFour.webp"
  }`
};

const exampleSelect = document.getElementById('example-section-select');
const exampleTextarea = document.getElementById('json-example');

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return json.replace(/("(.*?)")(\s*:)/g, '<span class="json-key">$1</span>$3');
}

function updateExample() {
  const value = exampleSelect.value;
  const raw = examples[value] || "";
  document.getElementById('json-example').innerHTML = syntaxHighlight(raw);
}

updateExample();

exampleSelect.addEventListener('change', updateExample);
