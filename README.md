# Caretech website

This is a static website. The complete site is in `dist/`; no package installation or ChatGPT hosting is needed.

## Run locally

From this project directory:

```sh
python3 -m http.server 8768 --directory dist
```

Open http://localhost:8768/ in a browser. Press Ctrl+C in the terminal to stop the server.

The contact form currently saves enquiries in the browser's local storage. It does not email them to Caretech. Connect a form backend and add Caretech's real phone, email, address, and logo before using the site for customers.
