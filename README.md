# Shibabox Website

Responsive Angular link page for [shibabox.de](https://shibabox.de), built with Tailwind CSS and GSAP.

## Local development

```bash
npm install
npm start
```

## Deployment

Every push to `main` runs tests, creates a production build and publishes it to the `gh-pages` branch. The custom domain is kept in `public/CNAME` and is also passed to `angular-cli-ghpages` during deployment.

In the GitHub repository settings, configure Pages to deploy from the `gh-pages` branch and its root directory.
