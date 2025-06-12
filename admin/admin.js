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

        files.forEach(file => {
            const container = document.createElement('div');
            container.style.textAlign = 'center';

            const img = document.createElement('img');
            img.src = `/assets/${file}`;
            img.alt = file;
            img.style.width = '100px';
            img.style.height = 'auto';
            img.style.border = '1px solid #ccc';
            img.style.borderRadius = '6px';

            const label = document.createElement('div');
            label.textContent = file;
            label.style.fontSize = '12px';

            container.appendChild(img);
            container.appendChild(label);
            gallery.appendChild(container);
        });
    } catch (err) {
        console.error('Erreur chargement images :', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadImages();
});
