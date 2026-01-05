async function loadData() {
  const attempts = ['data/resume.json', '../data/resume.json'];
  for (const path of attempts) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (res.ok) return res.json();
    } catch (err) {
      continue;
    }
  }
  throw new Error('Unable to load resume.json');
}

function setLink(id, url, fallback) {
  const el = document.getElementById(id);
  if (el && url) {
    el.href = url;
  } else if (el && fallback) {
    el.href = fallback;
  }
}

function renderHero(data) {
  const { basics } = data;
  if (basics?.name) document.getElementById('hero-name').textContent = basics.name;
  if (basics?.summary) document.getElementById('hero-summary').textContent = basics.summary;
  if (basics?.location) {
    document.getElementById('hero-location').textContent = basics.location;
    document.getElementById('footer-location').textContent = basics.location;
  }
  setLink('email-link', `mailto:${basics.email}`);
  setLink('linkedin-link', basics.links?.linkedin, '#');
  setLink('github-link', basics.links?.github, '#');
  setLink('scholar-link', basics.links?.scholar, '#');
  setLink('resume-link', basics.links?.resume || 'main.pdf');
  setLink('footer-email', `mailto:${basics.email}`);
  setLink('footer-linkedin', basics.links?.linkedin, '#');
  setLink('footer-github', basics.links?.github, '#');
  setLink('footer-scholar', basics.links?.scholar, '#');
}

function makeTag(tag) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = tag;
  return span;
}

function renderProjects(data) {
  const container = document.getElementById('project-cards');
  if (!container) return;
  data.projects.slice(0, 6).forEach((proj) => {
    const card = document.createElement('article');
    card.className = 'card';
    const thumb = `<div class="card-thumb" style="background-image:url('../assets/img/${proj.slug}.jpg')"></div>`;
    card.innerHTML = `
      ${thumb}
      <h3>${proj.title}</h3>
      <p class="impact">${proj.impact}</p>
      <div class="tags">${proj.tags.map((t) => makeTag(t).outerHTML).join('')}</div>
      <div class="card-actions">
        <a href="projects/${proj.slug}.html">Details</a>
        <a href="${proj.code || '#'}" target="_blank" rel="noreferrer">Code</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderExperience(data) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;
  data.experience.forEach((role) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="time">${role.dates}</div>
      <div>
        <h3>${role.role}</h3>
        <div class="org">${role.organization}${role.location ? ` — ${role.location}` : ''}</div>
        <ul>${role.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderSkills(data) {
  const container = document.getElementById('skill-grid');
  if (!container) return;
  Object.entries(data.skills).forEach(([group, items]) => {
    const col = document.createElement('div');
    col.className = 'skill-col';
    col.innerHTML = `<h4>${group}</h4><div class="chips">${items.map((i) => `<span class="chip">${i}</span>`).join('')}</div>`;
    container.appendChild(col);
  });
}

function renderPublications(data) {
  const selectedContainer = document.getElementById('selected-pubs');
  const allContainer = document.getElementById('all-pubs');
  if (!selectedContainer || !allContainer) return;

  const all = [];
  Object.entries(data.publications).forEach(([group, pubs]) => {
    pubs.forEach((p) => all.push({ ...p, group }));
  });
  const selected = all.slice(0, 4);

  function pubMarkup(p) {
    const title = p.url
      ? `<a href="${p.url}" target="_blank" rel="noreferrer">${p.title}</a>`
      : p.title;
    const venue = p.venue || 'Publication';
    const year = p.year ? ` (${p.year})` : '';
    return `
      <div class="pub">
        <h4>${title}</h4>
        <div class="venue">${p.authors} — ${venue}${year}</div>
      </div>
    `;
  }

  selectedContainer.innerHTML = selected.map(pubMarkup).join('');
  allContainer.innerHTML = all.map(pubMarkup).join('');

  const toggle = document.getElementById('toggle-pubs');
  toggle?.addEventListener('click', () => {
    allContainer.classList.toggle('hidden');
    toggle.textContent = allContainer.classList.contains('hidden') ? 'Show all' : 'Hide list';
  });

  const patentList = document.getElementById('patent-list');
  if (patentList) {
    patentList.innerHTML = data.patents
      .map((p) => `<li>${p.url ? `<a href="${p.url}" target="_blank" rel="noreferrer">${p.title}</a>` : p.title} — ${p.certificate}</li>`)
      .join('');
  }
}

function renderProjectPage(data, slug) {
  const project = data.projects.find((p) => p.slug === slug);
  if (!project) return;
  const titleEl = document.getElementById('project-title');
  const impactEl = document.getElementById('project-impact');
  const listEl = document.getElementById('project-details');
  const tagsEl = document.getElementById('project-tags');
  const codeEl = document.getElementById('project-code');
  const demoLinkEl = document.getElementById('project-demo-link');
  const relatedEl = document.getElementById('related-list');
  const archImg = document.getElementById('arch-img');
  const demoSection = document.getElementById('project-demo-section');
  const demoContainer = document.getElementById('project-demo');
  const archSection = document.getElementById('project-arch-section');

  if (titleEl) titleEl.textContent = project.title;
  if (impactEl) impactEl.textContent = project.impact;
  if (listEl) listEl.innerHTML = project.details.map((d) => `<li>${d}</li>`).join('');
  if (tagsEl) tagsEl.innerHTML = project.tags.map((t) => `<span class="chip">${t}</span>`).join('');
  if (codeEl) codeEl.href = project.code || '#';
  if (demoLinkEl) demoLinkEl.href = project.demo || '#';
  if (demoLinkEl && !project.demo) demoLinkEl.classList.add('hidden');
  if (archImg && project.archImage) archImg.src = project.archImage;

  if (demoSection && demoContainer) {
    demoContainer.innerHTML = '';
    if (project.videos && project.videos.length) {
      project.videos.forEach((video, index) => {
        const wrapper = document.createElement('div');
        if (index > 0) wrapper.style.marginTop = '12px';
        const label = video.label ? `<p class="muted">${video.label}</p>` : '';
        wrapper.innerHTML = `
          ${label}
          <video controls width="100%">
            <source src="${video.src}" type="${video.type}">
            Your browser does not support the video tag.
          </video>
        `;
        demoContainer.appendChild(wrapper);
      });
      demoSection.classList.remove('hidden');
    } else {
      demoSection.classList.add('hidden');
    }
  }

  if (archSection) {
    if (project.archImage) {
      archSection.classList.remove('hidden');
    } else {
      archSection.classList.add('hidden');
    }
  }

  if (relatedEl) {
    if (project.related && project.related.length) {
      relatedEl.innerHTML = project.related.map((r) => `<li>${r}</li>`).join('');
    } else {
      relatedEl.innerHTML = '<li>No related publications or patents listed.</li>';
    }
  }
}

function setupThemeToggle() {
  let stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch (err) {
    stored = null;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored ? stored === 'dark' : prefersDark;
  const body = document.body;
  const root = document.documentElement;

  function applyTheme(dark) {
    body.classList.toggle('theme-dark', dark);
    root.classList.toggle('theme-dark', dark);
    if (toggle) toggle.textContent = dark ? 'Light mode' : 'Dark mode';
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (err) {
      // Ignore storage errors (private mode, file://, etc.).
    }
  }

  let toggle = document.getElementById('theme-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.type = 'button';
    toggle.className = 'btn ghost small theme-toggle floating';
    document.body.appendChild(toggle);
  }

  applyTheme(isDark);
  toggle.addEventListener('click', () => {
    applyTheme(!body.classList.contains('theme-dark'));
  });
}

async function init() {
  try {
    setupThemeToggle();
    const data = await loadData();
    const page = document.body.dataset.page;
    if (page === 'home') {
      renderHero(data);
      renderProjects(data);
      renderExperience(data);
      renderSkills(data);
      renderPublications(data);
    } else if (page === 'project') {
      const slug = document.body.dataset.project;
      renderProjectPage(data, slug);
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', init);
