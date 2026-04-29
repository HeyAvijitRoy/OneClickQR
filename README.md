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
* **Privacy-Focused**: All generation happens in-browser; user data never leaves the client.
* **Campaign Tracking**: Build tracked URLs with UTM parameters for Google Analytics, GA4, LinkedIn, and Newsletter campaigns.
* **Custom URL Parameters**: Add custom key-value pairs to tracked URLs.
* **Logo Overlay**: Add custom logos/images to QR codes with auto-sizing.
* **Color Customization**: Choose dark and light colors, or use transparent backgrounds.
* **Error Correction**: Select error correction levels (L, M, Q, H) for different use cases.
* **Text Labels**: Add optional labels below QR codes with auto-fitting text.
* **Preset System**: Save and load QR generation presets for quick reuse.
* **Customizable Theme**: Easily restyle via CSS variables in `css/style.css`.

---

## ✨ Advanced Features

### Campaign Tracking & UTM Parameters
Build tracked URLs with pre-configured campaign templates or custom parameters:
* **Google Ads**: Optimized for Google Ads campaigns
* **GA4**: Google Analytics 4 compatible parameters
* **LinkedIn**: LinkedIn campaign tracking
* **Newsletter**: Email newsletter tracking

### Logo & Design Customization
* Upload custom logos (PNG, JPG, SVG) to embed in QR codes
* Customize QR code colors (dark and light)
* Enable transparent backgrounds for flexible placement
* Add optional labels below QR codes with automatic text scaling

### Quality & Flexibility
* **Error Correction Levels**: Choose between L (7%), M (15%), Q (25%), and H (30%)
* **Multiple Output Formats**: Download as PNG (raster) or SVG (vector)
* **Label Auto-Fitting**: Text automatically scales and wraps to fit QR code size

### Presets & Workflow
* Save frequently used QR configurations as presets
* Quickly load recent presets for faster generation
* Browser-based storage (no account needed)

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
