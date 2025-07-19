<a href="https://webapp.faithfulpack.net" target="_blank">
  <img
    src="https://database.faithfulpack.net/images/branding/logos/transparent/hd/main_logo.png?w=256"
    alt="Faithful Logo"
    align="right"
  >
</a>
<div align="center">
  <h1>Faithful Web App</h1>
  <h3>The official web application for the Faithful website.</h3>

  ![RepoSize](https://img.shields.io/github/repo-size/Faithful-Resource-Pack/App)
  ![Issues](https://img.shields.io/github/issues/Faithful-Resource-Pack/App)
  ![PullRequests](https://img.shields.io/github/issues-pr/Faithful-Resource-Pack/App)

  ![Status](https://status.faithfulpack.net/api/badge/4/status)
  ![Uptime](https://status.faithfulpack.net/api/badge/4/uptime/24?label=24h%20&labelSuffix=Uptime)
</div>

---

## Requirements
- NodeJS 20+ https://nodejs.org
- pnpm (`corepack enable` + `corepack prepare pnpm@latest --activate`)

## Running

```bash
pnpm install
```
```bash
pnpm dev
```

## Building

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

If you're using Apache to serve the site, make sure to set `FallbackResource` to point to `./dist/index.html` so Vue routing works properly.

```xml
<VirtualHost *:80>
  DocumentRoot /your/site/path/here/dist
  FallbackResource /index.html
</VirtualHost>
```

## API Reference

This project is heavily developed around our public API. Check out our API documentation at https://api.faithfulpack.net/docs for more information about endpoints and making requests.

## Translating

Many messages shown throughout the site can be translated into users' native languages for easier usage. Our translation service is powered by Crowdin, [and you can start translating there](https://faithful.crowdin.com/webapp) by clicking on your language in the list. Please contact us on our Discord server if a language you want to translate isn't listed.
