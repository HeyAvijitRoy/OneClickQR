# OneClickQR

[![Visit our website](https://img.shields.io/badge/website-blue)](https://www.oneclickqr.com/)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

**Free, Instant QR Code Generator** that runs 100% client-side—no backend, no signup required. Generate high-resolution QR codes for URLs, vCards, text, email, Wi-Fi, and more with transparent PNG or SVG downloads.

---

## 🎯 Features

* **100% Client-Side**: No server needed; perfect for GitHub Pages.
* **Multiple Content Types**: URL, Text, Email, vCard, Wi-Fi.
* **High-Resolution PNG**: Download at 1200×1200px with transparent background.
* **SVG Download**: Vector output for infinite scaling.
* **Customizable**: Easily restyle via CSS variables in `css/style.css`.
* **Privacy-Focused**: All generation happens in-browser; user data never leaves the client.

---

## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/heyavijitroy/OneClickQR.git
   cd OneClickQR
   ```
2. **Open locally**

   * Double-click `index.html` or serve with any static server.
   * Example: `npx serve .`
3. **View the live demo**

   * GitHub Pages: [https://heyavijitroy.github.io/OneClickQR/](https://heyavijitroy.github.io/OneClickQR/)
   * Custom Domain: [https://www.oneclickqr.com/](https://www.oneclickqr.com/)

---

## 📁 Project Structure

```
OneClickQR/
├── index.html          # Main client-side page
├── css/                # Styles
│   ├── bootstrap.min.css
│   └── style.css       # Theme overrides & layout
├── js/                 # Client logic
│   └── app.js          # QR build & download handlers
├── library/            # QR code libraries
│   ├── qrcode.min.js   # qrcodejs (canvas)
│   └── qrcode-svg.min.js # qrcode-svg (vector)
├── assets/             # Illustrations & images
│   └── hero-qr.svg
├── favicon/            # Favicon files
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Use
└── README.md           # GitHub project overview
```

---

## ⚙️ Configuration

* **Colors & Theme**: Adjust `--primary`, `--accent` in `css/style.css`.
* **Favicons**: Replace files in `favicon/` and update links in `index.html`.
* **AdSense**: Insert your AdSense snippet in `index.html` footer once approved.

---

## 📄 License

To ensure users give credit when using or redistributing this project, we recommend using the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

```text
CC BY 4.0
```

This license allows others to share and adapt the code/content even for commercial purposes, as long as they provide proper attribution to the original author.

---

*Built with ❤️ by Avijit Roy*
