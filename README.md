# OneClickQR

[![Visit our website](https://img.shields.io/badge/website-blue)](https://www.oneclickqr.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Free, instant QR code generator** that creates QR codes in your browser with no account or QR-processing backend. Generate QR codes for URLs, vCards, text, email, and Wi-Fi with PNG, JPG, or SVG downloads. The site also uses Google Analytics and includes Google AdSense code; see the [Privacy Policy](privacy.html).

---

## 🎯 Features

* **Browser-Based Generation**: QR inputs and images are processed locally; no account or QR-processing backend is needed.
* **Multiple Content Types**: URL, Text, Email, vCard, Wi-Fi.
* **PNG Download**: Choose 600, 1200, or 1800 px width with a solid or transparent background.
* **JPG Download**: Use the selected solid background color, even when PNG transparency is enabled.
* **SVG Download**: Vector output for infinite scaling.
* **Local Presets**: Saved presets, including their QR inputs and optional logo, stay in this browser's local storage. Google Analytics measures site visits, and AdSense code may process visit data as described in the [Privacy Policy](privacy.html).
* **Campaign Tags**: Add UTM parameters to QR destinations for analysis on the destination site. OneClickQR does not record QR scans.
* **Custom URL Parameters**: Add custom key-value pairs to tracked URLs.
* **Logo Overlay**: Add custom logos/images to QR codes with auto-sizing.
* **Color Customization**: Choose dark and light colors, or use transparent backgrounds.
* **Pattern and Eye Design**: Choose square, soft-corner, or dot modules; change the three finder eyes and their color.
* **Frames**: Add a square or rounded outline with a separate frame color.
* **Error Correction**: Select error correction levels (L, M, Q, H) for different use cases.
* **Text Labels**: Add optional labels below QR codes with auto-fitting text.
* **Preset System**: Save and load QR generation presets for quick reuse.
* **Customizable Theme**: Easily restyle via CSS variables in `css/style.css`.

---

## ✨ Advanced Features

### Campaign Tracking & UTM Parameters
Build URLs with pre-configured campaign tags or custom parameters for use with analytics on the destination site:
* **Google Ads**: Optimized for Google Ads campaigns
* **GA4**: Google Analytics 4 compatible parameters
* **LinkedIn**: LinkedIn campaign tracking
* **Newsletter**: Email newsletter tracking

### Logo & Design Customization
* Upload custom logos (PNG, JPG, SVG) to embed in QR codes
* Customize QR code colors (dark and light)
* Choose module and finder-eye shapes and a separate eye color
* Add an optional square or rounded frame with its own color
* Enable transparent backgrounds for flexible placement
* Add optional labels below QR codes with automatic text scaling

### Quality & Flexibility
* **Error Correction Levels**: Choose between L (7%), M (15%), Q (25%), and H (30%)
* **Multiple Output Formats**: Download as PNG or JPG (raster), or SVG (vector)
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
├── library/            # Bundled QR libraries
│   ├── qrcode.min.js   # QR matrix generation for all exports
│   └── svg-qrcode.min.js # Legacy library, no longer loaded
├── assets/             # Illustrations & images
│   └── hero-qr.svg
├── favicon/            # Favicon files
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Use
├── LICENSE             # MIT license for original OneClickQR work
├── THIRD_PARTY_NOTICES.md # Bundled library license notices
└── README.md           # GitHub project overview
```

---

## ⚙️ Configuration

* **Colors & Theme**: Adjust `--primary`, `--accent` in `css/style.css`.
* **Favicons**: Replace files in `favicon/` and update links in `index.html`.
* **Google Analytics**: The GA4 tag is included in the `index.html` head. Review consent behavior for the regions where the site is available.
* **AdSense**: The AdSense loader is included in the `index.html` head.
* **Privacy messages**: Configure and publish the appropriate consent messages in AdSense Privacy & messaging before serving ads where required. Google requires a certified consent management platform for personalized ads in the EEA, UK, and Switzerland. Review US state message settings where applicable.

---

## 📄 License

The original OneClickQR source code and site content in this repository are available under the [MIT License](LICENSE). You may use, modify, and redistribute them, including commercially, if you keep the copyright and license notice. Bundled libraries retain their own copyrights and MIT licenses; see [Third-Party Notices](THIRD_PARTY_NOTICES.md).

Visitors may use QR codes they generate for personal or commercial projects without attributing OneClickQR. They remain responsible for rights to any content, logo, or destination they include. See the hosted site's [Terms of Use](terms.html).

Copies previously obtained under CC BY 4.0 keep the rights granted by that license.

---

*Built with ❤️ by Avijit Roy*
