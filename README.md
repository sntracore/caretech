# CareTech website

CareTech is a static website. The finished files are in `dist/`; no package installation or ChatGPT hosting is required.

## Run locally

From this project directory:

```sh
node scripts/generate-pages.mjs
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000/>. If port 8000 is already in use, choose another port. Press Ctrl+C in the terminal to stop the server.

## Deploy to Vercel

Import `sntracore/caretech` as a new Vercel project. The repository includes `vercel.json`, which sets the build command, `dist` output directory, route handling, and security headers. Leave the project Root Directory at the repository root. Pushes to `main` trigger deployments when the Vercel Git integration is connected.

Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used at build time to generate canonical URLs and `sitemap.xml`. If that system variable is unavailable, set `SITE_URL` to the final HTTPS site origin, such as `https://example.com`, and redeploy. Do not include a path in `SITE_URL`.

## Assets and enquiries

The optimized assets in `dist/assets/` were made from the supplied brand, customer, project and company logo files. The source folders are kept locally and ignored by Git. To remake the assets, install Pillow and run `python3 scripts/prepare_assets.py` with the original folders present.

The contact form opens the visitor's email app with a prepared message addressed to `caretechforit@gmail.com`. It does not send or store submissions on the website. The listed phone number comes from the supplied CareTech logo PDF.
