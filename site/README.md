# Portfolio Site

Static site for showcasing robotics/autonomy work. No build tools required.

## Preview locally
- From the `site/` directory: `python -m http.server 8000`
- Open `http://localhost:8000` in a browser.

## Deploy to GitHub Pages
- Push the `site/` folder to your repository.
- In GitHub, go to **Settings → Pages** and select the branch containing `site/` with `/` (root) as the folder.
- Wait for the Pages build to finish, then browse the published URL.

## Assets
- Place images in `assets/img/` (e.g., `assets/img/mind-cavs.jpg`, `assets/img/mind-cavs-arch.png`).
- Place videos in `assets/video/` (e.g., `assets/video/mind-cavs.mp4`).
- Profile photo can replace `assets/img/profile.jpg`.

## Content updates
- Edit `data/resume.json` to update contact info, skills, experience, projects, publications, and patents.
- Project pages read from `data/resume.json` using their slug (`projects/<slug>.html`).
- Homepage pulls featured projects, experience timeline, skills chips, and publication lists from the same file.
