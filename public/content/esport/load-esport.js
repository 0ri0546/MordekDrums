document.addEventListener("DOMContentLoaded", () => {
  fetch('content/esport/esport.json')
    .then(response => response.json())
    .then(players => {
      const container = document.querySelector('.esport-container');

      // Séparer la carte centrale des autres
      const centerPlayer = players.find(p => p.position === 'center-photo');
      const sidePlayers = players.filter(p => p.position !== 'center-photo');

      // Injecter les cartes latérales d'abord
      sidePlayers.forEach(player => {
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

      // Injecter la carte centrale à la fin
      if (centerPlayer) {
        const a = document.createElement('a');
        a.classList.add(centerPlayer.position);
        a.href = centerPlayer.link;
        a.target = '_blank';

        const div = document.createElement('div');
        div.classList.add('player-card');
        div.style.backgroundImage = `url(${centerPlayer.image})`;

        a.appendChild(div);
        container.appendChild(a);
      }
    })
    .catch(err => console.error('Erreur chargement esport JSON:', err));
});
