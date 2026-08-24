# Portfolio Website

## Purpose

This personal portfolio presents Nikhil Sai's background, technical skills, internship experience, education, projects, and contact information for software engineering and web development opportunities.

## Planning and design

The page uses a single-scroll layout with a clear navigation path: hero, About, Skills, Experience, Projects, Education, and Contact. The visual direction uses a dark technical interface with magenta, lime, cyan, and orange signals to connect the software, hardware, and AI focus.

## Technology

- Semantic HTML5 for structure and accessibility
- CSS3 with responsive grid layouts, custom properties, focus states, and reduced-motion support
- Vanilla JavaScript for the sticky header, responsive menu, keyboard focus trap, smooth section navigation, and scroll spy
- Google Fonts for display, body, and monospace typography

## Testing and optimization

The page was checked locally in a browser at desktop and mobile widths. The accessibility tree contains the main sections and navigation, the stylesheet and JavaScript load successfully, and the mobile menu exposes an accessible expanded state. Images include descriptive alt text and dimensions, and the HTML includes viewport and description metadata.

## Deployment

The project is hosted in the `Nikhilsai17321/portfolio` GitHub repository. GitHub Pages deployment is configured through `.github/workflows/pages.yml` and runs on pushes to `main`. Enable **GitHub Actions** as the Pages source in the repository settings, then use:

`https://nikhilsai17321.github.io/portfolio/`

## Known constraints

The project links currently point to the author's GitHub profile because separate public repositories for the two listed projects were not provided. Replace those destinations with direct repository or live-demo URLs when available.
