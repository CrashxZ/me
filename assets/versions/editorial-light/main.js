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
  if (basics?.name && document.getElementById('hero-name')) document.getElementById('hero-name').textContent = basics.name;
  if (basics?.title) document.getElementById('hero-role').textContent = basics.title;
  // Homepage introduction is intentionally shorter than the resume summary.
  if (basics?.location) {
    document.getElementById('hero-location').textContent = basics.location;
    if (document.getElementById('footer-location')) document.getElementById('footer-location').textContent = basics.location;
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
  const featured = data.projects.filter((project) => project.featured);
  container.innerHTML = featured.map((project, index) => `<article class="work-row"><span class="work-number">0${index + 1}</span><div><div class="system-topline">${project.category}</div><h3>${project.title}</h3><p>${project.outcome || project.impact}</p><div class="work-tools">${project.tags.slice(0, 3).join(' / ')}</div></div><div class="card-actions">${projectLinks(project)}</div></article>`).join('');
}

function projectLinks(project) {
  return [
    project.page ? `<a href="${project.page}">View project</a>` : '',
    project.demo ? `<a href="${project.demo}" target="_blank" rel="noreferrer">Demo</a>` : '',
    project.code ? `<a href="${project.code}" target="_blank" rel="noreferrer">Source</a>` : '',
    project.related?.[0]?.url ? `<a href="${project.related[0].url}" target="_blank" rel="noreferrer">${project.related[0].label || 'Paper'}</a>` : ''
  ].filter(Boolean).join('');
}

function projectMarkup(project, detailed = false) {
  const detail = detailed && project.challenge && project.outcome
    ? `<div class="system-detail"><strong>Engineering challenge</strong><p>${project.challenge}</p></div>
       <div class="system-detail"><strong>Outcome</strong><p>${project.outcome}</p></div>`
    : '';
  return `
    <article class="${detailed ? 'system-card' : 'project-card'}" data-category="${project.category}">
      <div class="system-topline"><span>${project.category}</span><span>${project.status}</span></div>
      <h3>${project.title}</h3>
      <p class="impact">${project.impact}</p>
      ${detail}
      <div class="tags">${project.tags.slice(0, detailed ? 5 : 4).map((tag) => makeTag(tag).outerHTML).join('')}</div>
      <div class="card-actions">${projectLinks(project)}</div>
    </article>
  `;
}

function renderProjectLibrary(data) {
  const container = document.getElementById('project-library');
  if (!container) return;
  container.innerHTML = data.projects.filter(project => !project.featured)
    .map(project => projectMarkup(project)).join('');
}

function renderHobbyBuilds(data) {
  const container = document.getElementById('hobby-builds-projects');
  if (!container) return;
  container.innerHTML = data.projects
    .filter((project) => project.category === 'Hobby')
    .map((project) => projectMarkup(project))
    .join('');
}

function renderExperience(data) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;
  container.innerHTML = data.experience.map((role) => `
    <article class="timeline-item"><div class="time">${role.dates}</div><div>
      <h3>${role.organization.split(' — ')[0]}</h3><div class="org">${role.role}</div>
      <p>${role.portfolioSummary || role.highlights[0]}</p>
    </div></article>`).join('');
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
  const selected = all.slice(0, 2);
  const selectedTitles = new Set(selected.map((p) => p.title));
  const remaining = all.filter((p) => !selectedTitles.has(p.title));

  function pubMarkup(p) {
    const title = p.url
      ? `<a href="${p.url}" target="_blank" rel="noreferrer">${p.title}</a>`
      : p.title;
    const venue = p.venue || 'Publication';
    const year = p.year ? ` (${p.year})` : '';
    return `
      <div class="pub">
        <h4>${title}</h4>
        <div class="venue">${venue}${year}</div>
      </div>
    `;
  }

  selectedContainer.innerHTML = selected.map(pubMarkup).join('');
  allContainer.innerHTML = remaining.map(pubMarkup).join('');

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
  if (codeEl && !project.code) codeEl.classList.add('hidden');
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
      relatedEl.innerHTML = project.related.map((r) => {
        if (typeof r === 'string') return `<li>${r}</li>`;
        return `<li><a href="${r.url}" target="_blank" rel="noreferrer">${r.title}</a></li>`;
      }).join('');
    } else {
      relatedEl.innerHTML = '<li>No related publications or patents listed.</li>';
    }
  }
}

function setupThemeToggle() {
  const themeKey = document.body.dataset.page === 'home' ? 'editorial-theme' : 'theme';
  let stored = null;
  try {
    stored = localStorage.getItem(themeKey);
  } catch (err) {
    stored = null;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored ? stored === 'dark' : (document.body.dataset.defaultTheme === 'dark' || prefersDark);
  const body = document.body;
  const root = document.documentElement;

  function applyTheme(dark) {
    body.classList.toggle('theme-dark', dark);
    root.classList.toggle('theme-dark', dark);
    if (toggle) toggle.textContent = dark ? 'Light mode' : 'Dark mode';
    try {
      localStorage.setItem(themeKey, dark ? 'dark' : 'light');
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
    if (document.body.dataset.page !== 'home' || document.getElementById('theme-toggle')) setupThemeToggle();
    const data = await loadData();
    const page = document.body.dataset.page;
    if (page === 'home') {
      renderHero(data);
      renderProjects(data);
      renderProjectLibrary(data);
      renderHobbyBuilds(data);
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
