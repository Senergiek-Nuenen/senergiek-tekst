if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        registration.update().catch((error) => {
          console.warn('De controle op een Senergiek-appupdate is mislukt.', error);
        });
      })
      .catch((error) => {
        console.error('De offline ondersteuning kon niet worden gestart.', error);
      });
  });
}

const internetMessages = {
  agenda: 'Voor Agenda is een internetverbinding nodig. Schakel internet in en probeer het opnieuw.',
  website: 'Voor de Senergiek-website is een internetverbinding nodig. Schakel internet in en probeer het opnieuw.'
};

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-internet-required]');
  if (!link || navigator.onLine) return;

  event.preventDefault();
  const message = internetMessages[link.dataset.internetRequired]
    || 'Voor deze pagina is een internetverbinding nodig.';
  window.alert(message);
});
