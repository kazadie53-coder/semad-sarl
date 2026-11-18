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
      container.classList.add('news-accordion');
      const count = document.getElementById('news-count');
      const search = document.getElementById('news-search');
      const total = posts.length;
      if (count) count.textContent = total + (total > 1 ? ' publications' : ' publication');

      posts.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach((post, index) => {
        const article = document.createElement('details');
        article.className = 'news-entry';
        article.dataset.search = [post.title, post.summary, post.content].join(' ').toLocaleLowerCase('fr-FR');

        const heading = document.createElement('summary');
        heading.className = 'news-entry-heading';
        const headingText = document.createElement('span');
        headingText.className = 'news-entry-heading-text';
        const date = document.createElement('span');
        date.className = 'news-date';
        date.textContent = post.date ? new Date(post.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        const title = document.createElement('span');
        title.className = 'news-entry-title';
        title.textContent = post.title || 'Actualité SEMAD SARL';
        headingText.append(date, title);
        const arrow = document.createElement('span');
        arrow.className = 'news-entry-arrow';
        arrow.textContent = '+';
        arrow.setAttribute('aria-hidden', 'true');
        heading.append(headingText, arrow);

        const body = document.createElement('div');
        body.className = 'news-entry-body';
        if (post.image) {
          const image = document.createElement('img');
          image.className = 'news-entry-image';
          image.src = post.image.startsWith('http') ? post.image : new URL(post.image.replace(/^\/+/, ''), document.baseURI).href;
          image.alt = post.image_alt || post.title || 'Actualité SEMAD SARL';
          image.loading = 'lazy';
          image.onerror = () => {
            image.onerror = null;
            image.src = new URL('logo-semad.png', document.baseURI).href;
          };
          body.appendChild(image);
        }
        if (post.summary) {
          const summary = document.createElement('p');
          summary.className = 'news-entry-intro';
          summary.textContent = post.summary;
          body.appendChild(summary);
        }
        if (post.content) {
          const content = document.createElement('div');
          content.className = 'news-entry-content';
          content.textContent = post.content;
          body.appendChild(content);
        }
        article.append(heading, body);
        container.appendChild(article);
        article.addEventListener('toggle', () => {
          if (!article.open) return;
          container.querySelectorAll('.news-entry[open]').forEach(other => {
            if (other !== article) other.open = false;
          });
        });
      });
      if (search) search.addEventListener('input', () => {
        const term = search.value.trim().toLocaleLowerCase('fr-FR');
        let visible = 0;
        container.querySelectorAll('.news-entry').forEach(article => {
          const match = article.dataset.search.includes(term);
          article.hidden = !match;
          if (!match) article.open = false;
          if (match) visible++;
        });
        if (count) count.textContent = visible + (visible > 1 ? ' publications' : ' publication') + (term ? ' trouvée(s)' : '');
      });
    })
    .catch(() => {
      // Garder le contenu de secours si le fichier d'actualités est indisponible.
    });
})();