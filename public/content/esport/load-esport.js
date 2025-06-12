// load-esport.js (par exemple)
document.addEventListener("DOMContentLoaded", () => {
  fetch('content/esport/esport.json')
    .then(response => response.json())
    .then(players => {
      const container = document.querySelector('.esport-container');
      players.forEach(player => {
        const a = document.createElement('a');
        a.classList.add(player.position);
        a.href = player.link;
        a.target = '_blank';

        const div = document.createElement('div');
        div.classList.add('player-card');
        div.style.backgroundImage = `url(${player.image})`;

        a.appendChild(div);
        container.appendChild(a);
      });
    })
    .catch(err => console.error('Erreur chargement esport JSON:', err));
});
