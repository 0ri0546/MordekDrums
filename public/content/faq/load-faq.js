document.addEventListener('DOMContentLoaded', () => {
  fetch('content/faq/faq.json')
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector('.faq-container');
      container.innerHTML = '';

      data.forEach(item => {
        const box = document.createElement('div');
        box.classList.add('faq-box');

        const question = document.createElement('div');
        question.classList.add('faq-question');
        question.textContent = item.question;

        const answer = document.createElement('div');
        answer.classList.add('faq-answer');
        answer.textContent = item.answer;

        box.appendChild(question);
        box.appendChild(answer);
        container.appendChild(box);
      });
    })
    .catch(error => console.error('Erreur chargement FAQ:', error));
});
