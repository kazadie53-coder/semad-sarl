(function () {
  const container = document.getElementById('news-list');
  if (!container) return;

  const fetchPosts = async () => {
    const local = await fetch('./news.json', {cache:'no-store'}).then(r => r.ok ? r.json() : {posts:[]}).catch(() => ({posts:[]}));
    const posts = Array.isArray(local.posts) ? local.posts : [];
    try {
      const response = await fetch('./admin/config.json', {cache:'no-store'});
      if (!response.ok) throw new Error('Configuration indisponible');
      const config = await response.json();
      if (!config.url || !config.publishableKey || config.publishableKey.includes('REMPLACER')) throw new Error('Configuration incomplète');
      const result = await fetch(config.url + '/rest/v1/semad_posts?select=title,date,summary,content,image,video_url&order=date.desc', {
        headers: {apikey:config.publishableKey}, cache:'no-store'
      });
      if (!result.ok) throw new Error('Actualités distantes indisponibles');
      return {posts: [...await result.json(), ...posts]};
    } catch (error) {
      console.warn('Actualités Supabase indisponibles, affichage local maintenu.', error);
      return {posts};
    }
  };
  fetchPosts()
    .then(data => {
      const posts = (Array.isArray(data.posts) ? data.posts : []).filter(p => !String(p.title||'').startsWith('[RECRUTEMENT] '));
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
        if(post.video_url){try{const u=new URL(post.video_url);if(u.protocol==='https:'&&/^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&/^\/storage\/v1\/object\/public\/semad-videos\/[a-zA-Z0-9_-]+\.mp4$/i.test(u.pathname)){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=u.href;video.style.cssText='width:100%;max-height:540px;border-radius:12px;margin:12px 0;background:#0c1c32';video.setAttribute('aria-label','Vidéo : '+(post.title||'SEMAD SARL'));body.appendChild(video)}else{let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com'].includes(u.hostname)){id=u.searchParams.get('v')||(u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:'')}if(/^[a-zA-Z0-9_-]{11}$/.test(id)){const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id;frame.title='Vidéo : '+(post.title||'SEMAD SARL');frame.loading='lazy';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.style.cssText='width:100%;aspect-ratio:16/9;border:0;border-radius:12px;margin:12px 0';body.appendChild(frame)}}}catch(e){}}if (post.summary) {
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