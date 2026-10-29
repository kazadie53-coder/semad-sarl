(function () {
  const container = document.getElementById('news-list');
  if (!container) return;

  fetch('./news.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Impossible de charger les actualités');
      return response.json();
    })
    .then(data => {
      const posts = Array.isArray(data.posts) ? data.posts : [];
      if (!posts.length) return;

      container.innerHTML = '';
      posts.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach(post => {
        const article = document.createElement('article');
        article.className = 'news-card';

        if (post.image) {
          const image = document.createElement('img');
          image.className = 'news-image';
          image.src = post.image.startsWith('http') ? post.image : new URL(post.image.replace(/^\/+/, ''), document.baseURI).href;
          image.alt = post.image_alt || post.title || 'Actualité SEMAD SARL';
          image.loading = 'lazy';
          image.onerror = () => {
            image.onerror = null;
            image.src = new URL('/semad-sarl/logo-semad.png', window.location.origin).href;
          };
          article.appendChild(image);
        }

        const body = document.createElement('div');
        body.className = 'news-card-body';
        const date = document.createElement('p');
        date.className = 'news-date';
        date.textContent = post.date ? new Date(post.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        const title = document.createElement('h3');
        title.textContent = post.title || 'Actualité SEMAD SARL';
        const summary = document.createElement('p');
        summary.textContent = post.summary || '';
        body.append(date, title, summary);
        if (post.content) {
          const content = document.createElement('p');
          content.className = 'news-content';
          content.textContent = post.content;
          body.appendChild(content);
        }
        article.appendChild(body);
        container.appendChild(article);
      });
    })
    .catch(() => {
      // Garder le contenu de secours si le fichier d'actualités est indisponible.
    });
})();