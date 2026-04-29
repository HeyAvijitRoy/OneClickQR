/* ===== DOM short-cuts ===== */
const typeSel = document.getElementById('type');
const fieldSets = document.querySelectorAll('.field-group');
const form = document.getElementById('qrForm');
const qrDiv = document.getElementById('qrContainer');
const downloadBtns = document.getElementById('downloadBtns');
const qrStatus = document.getElementById('qrStatus');
const previewCard = document.querySelector('.preview-card');
const copyBtn = document.getElementById('btnCopyPayload');
const copyUrlBtn = document.getElementById('btnCopyUrl');
const trackingEnable = document.getElementById('trackEnable');
const trackingPanel = document.getElementById('trackingPanel');
const finalUrlPreview = document.getElementById('finalUrlPreview');
const embedMainUrl = document.getElementById('embedMainUrl');
const errorCorrection = document.getElementById('errorCorrection');
const darkColor = document.getElementById('darkColor');
const bgColor = document.getElementById('bgColor');
const transparentBg = document.getElementById('transparentBg');
const logoUpload = document.getElementById('logoUpload');
const clearLogoBtn = document.getElementById('clearLogoBtn');
const logoName = document.getElementById('logoName');
const presetName = document.getElementById('presetName');
const savePresetBtn = document.getElementById('savePresetBtn');
const recentPresets = document.getElementById('recentPresets');
const templateButtons = document.querySelectorAll('[data-template]');

const STORAGE_KEY = 'oneclickqr.recent-presets';
const MAX_RECENT_PRESETS = 5;

const CAMPAIGN_TEMPLATES = {
  'google-ads': {
    utmSource: 'google',
    utmMedium: 'qr',
    utmCampaign: 'google-ads',
    utmContent: 'poster',
    utmTerm: '',
    customParams: 'network=search',
  },
  ga4: {
    utmSource: 'website',
    utmMedium: 'qr',
    utmCampaign: 'ga4-campaign',
    utmContent: 'print',
    utmTerm: '',
    customParams: 'source_platform=offline',
  },
  linkedin: {
    utmSource: 'linkedin',
    utmMedium: 'qr',
    utmCampaign: 'linkedin-promo',
    utmContent: 'event',
    utmTerm: '',
    customParams: 'social=organic',
  },
  newsletter: {
    utmSource: 'newsletter',
    utmMedium: 'email',
    utmCampaign: 'newsletter',
    utmContent: 'header-banner',
    utmTerm: '',
    customParams: 'placement=email',
  },
};

let currentSvgUrl = '';
let updateTimer = null;
let renderToken = 0;
let logoDataUrl = '';
let logoFileName = '';

/* ===== UI helper ===== */
function setStatus(message, isError = false) {
  qrStatus.textContent = message;
  qrStatus.style.background = isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(91, 140, 255, 0.1)';
  qrStatus.style.color = isError ? '#b91c1c' : '#1f3c88';
}

function clearPreview(message = 'Add details to preview your QR code.') {
  qrDiv.innerHTML = '';
  downloadBtns.classList.add('d-none');
  if (currentSvgUrl) {
    URL.revokeObjectURL(currentSvgUrl);
    currentSvgUrl = '';
  }
  setStatus(message);
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getMeasureContext() {
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d');
}

function wrapTextLines(text, maxWidth, maxLines, fontSize) {
  const context = getMeasureContext();
  if (!context) {
    return [text];
  }

  context.font = `${fontSize}px Inter, Arial, sans-serif`;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  const pushLine = line => {
    if (line) {
      lines.push(line);
    }
  };

  words.forEach(word => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    pushLine(currentLine);
    currentLine = word;
  });

  pushLine(currentLine);

  if (lines.length > maxLines) {
    const limited = lines.slice(0, maxLines);
    const lastIndex = limited.length - 1;
    let lastLine = limited[lastIndex];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = lastLine.slice(0, -1);
    }
    limited[lastIndex] = `${lastLine}…`;
    return limited;
  }

  return lines;
}

function fitLabelText(text, maxWidth, maxLines, maxFontSize, minFontSize) {
  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const lines = wrapTextLines(text, maxWidth, maxLines, fontSize);
    const context = getMeasureContext();
    if (!context) {
      return { lines, fontSize };
    }

    context.font = `${fontSize}px Inter, Arial, sans-serif`;
    const widestLine = lines.reduce((widest, line) => Math.max(widest, context.measureText(line).width), 0);
    if (lines.length <= maxLines && widestLine <= maxWidth) {
      return { lines, fontSize };
    }
  }

  return {
    lines: wrapTextLines(text, maxWidth, maxLines, minFontSize),
    fontSize: minFontSize,
  };
}

function readRecentPresets() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecentPresets(presets) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.slice(0, MAX_RECENT_PRESETS)));
  } catch {
    setStatus('Unable to save the preset in this browser.', true);
  }
}

function getQrStyle() {
  const hasTransparentBackground = transparentBg.checked;
  return {
    errorCorrection: errorCorrection.value || 'M',
    darkColor: darkColor.value || '#0f172a',
    lightColor: hasTransparentBackground ? 'rgba(0,0,0,0)' : (bgColor.value || '#ffffff'),
    transparentBackground: hasTransparentBackground,
  };
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function roundRect(context, x, y, width, height, radius) {
  const cornerRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + cornerRadius, y);
  context.lineTo(x + width - cornerRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
  context.lineTo(x + width, y + height - cornerRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
  context.lineTo(x + cornerRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
  context.lineTo(x, y + cornerRadius);
  context.quadraticCurveTo(x, y, x + cornerRadius, y);
  context.closePath();
}

async function drawLogoOverlay(context, image, size) {
  if (!image) {
    return;
  }

  const boxSize = Math.max(58, Math.round(size * 0.18));
  const padding = Math.max(8, Math.round(boxSize * 0.16));
  const x = Math.round((size - boxSize) / 2);
  const y = Math.round((size - boxSize) / 2);
  const innerWidth = boxSize - padding * 2;
  const innerHeight = boxSize - padding * 2;
  const imageRatio = image.width / image.height;
  let drawWidth = innerWidth;
  let drawHeight = innerHeight;

  if (imageRatio > 1) {
    drawHeight = innerWidth / imageRatio;
  } else if (imageRatio < 1) {
    drawWidth = innerHeight * imageRatio;
  }

  const drawX = x + Math.round((boxSize - drawWidth) / 2);
  const drawY = y + Math.round((boxSize - drawHeight) / 2);

  context.save();
  context.fillStyle = 'rgba(255, 255, 255, 0.94)';
  context.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  context.lineWidth = 1;
  roundRect(context, x, y, boxSize, boxSize, Math.round(boxSize * 0.26));
  context.fill();
  context.stroke();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function buildLogoSvgMarkup(dataUrl, size) {
  if (!dataUrl) {
    return '';
  }

  const boxSize = Math.max(58, Math.round(size * 0.18));
  const padding = Math.max(8, Math.round(boxSize * 0.16));
  const x = Math.round((size - boxSize) / 2);
  const y = Math.round((size - boxSize) / 2);
  const innerX = x + padding;
  const innerY = y + padding;
  const innerSize = boxSize - padding * 2;

  return `
  <rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" rx="${Math.round(boxSize * 0.26)}" ry="${Math.round(boxSize * 0.26)}" fill="rgba(255,255,255,0.94)" stroke="rgba(15,23,42,0.08)"/>
  <image href="${dataUrl}" x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet"/>
  `;
}

async function decorateCanvas(baseCanvas, size, style, labelText = '') {
  const labelHeight = labelText ? Math.max(56, Math.round(size * 0.14)) : 0;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size + labelHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return baseCanvas;
  }

  if (!style.transparentBackground) {
    context.fillStyle = style.lightColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(baseCanvas, 0, 0, size, size);

  if (logoDataUrl) {
    try {
      const image = await loadImageFromDataUrl(logoDataUrl);
      await drawLogoOverlay(context, image, size);
    } catch {
      /* ignore logo load failures so QR generation still works */
    }
  }

  if (labelText) {
    const fitted = fitLabelText(labelText, size - 72, 2, Math.max(18, Math.round(size * 0.045)), 11);
    const fontSize = fitted.fontSize;
    const lines = fitted.lines;
    const lineHeight = Math.round(fontSize * 1.35);
    const totalTextHeight = lines.length * lineHeight;
    const startY = size + Math.round((labelHeight - totalTextHeight) / 2) + fontSize;

    context.fillStyle = '#0f172a';
    context.font = `${fontSize}px Inter, Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    lines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
  }

  return canvas;
}

function getEmbedLabel(rawUrl) {
  return formatDisplayUrl(rawUrl);
}

function createBaseQrCanvas(text, size, style) {
  const tmpDiv = document.createElement('div');
  new QRCodeCanvas(tmpDiv, {
    text,
    width: size,
    height: size,
    correctLevel: QRCodeCanvas.CorrectLevel[style.errorCorrection] || QRCodeCanvas.CorrectLevel.M,
    colorDark: style.darkColor,
    colorLight: style.lightColor
  });

  const canvas = tmpDiv.querySelector('canvas');
  if (canvas) {
    canvas.style.display = 'block';
  }
  return canvas;
}

async function createCanvasOutput(text, labelText, size, style) {
  const baseCanvas = createBaseQrCanvas(text, size, style);
  if (!baseCanvas) {
    return null;
  }

  if (!labelText && !logoDataUrl) {
    return baseCanvas;
  }

  return decorateCanvas(baseCanvas, size, style, labelText);
}

function createSvgWithDecorations(text, labelText, size, style) {
  const svgString = new QRCodeSVG({
    content: text,
    padding: 0,
    width: size,
    height: size,
    color: style.darkColor,
    background: style.lightColor,
    ecl: style.errorCorrection || 'M'
  }).svg();

  const parser = new DOMParser();
  const qrDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const qrRoot = qrDoc.documentElement;
  const innerMarkup = qrRoot.innerHTML;
  const viewBox = qrRoot.getAttribute('viewBox') || `0 0 ${size} ${size}`;

  const labelHeight = labelText ? Math.max(56, Math.round(size * 0.14)) : 0;
  const textNodes = labelText
    ? (() => {
        const fitted = fitLabelText(labelText, size - 72, 2, Math.max(18, Math.round(size * 0.045)), 11);
        const fontSize = fitted.fontSize;
        const lines = fitted.lines;
        const lineHeight = Math.round(fontSize * 1.35);
        const totalTextHeight = lines.length * lineHeight;
        const startY = size + Math.round((labelHeight - totalTextHeight) / 2) + fontSize;

        return lines.map((line, index) => {
          const y = startY + index * lineHeight;
          return `<text x="${size / 2}" y="${y}" text-anchor="middle" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="${fontSize}">${escapeXml(line)}</text>`;
        }).join('');
      })()
    : '';

  const logoMarkup = buildLogoSvgMarkup(logoDataUrl, size);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + labelHeight}" viewBox="0 0 ${size} ${size + labelHeight}">
  <svg x="0" y="0" width="${size}" height="${size}" viewBox="${viewBox}">${innerMarkup}</svg>
  ${logoMarkup}
  ${textNodes}
</svg>`;
}

function formatDisplayUrl(rawUrl) {
  const baseUrl = normalizeUrl(rawUrl);
  if (!baseUrl) {
    return '';
  }

  try {
    const parsed = new URL(baseUrl);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${host}${path}${parsed.search}${parsed.hash}` || host;
  } catch {
    return baseUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');
  }
}

function updateFinalUrlPreview() {
  if (!finalUrlPreview) {
    return;
  }

  if (typeSel.value !== 'URL') {
    finalUrlPreview.value = '';
    return;
  }

  const { data } = getActiveData();
  finalUrlPreview.value = buildTrackedUrl(data);
}

function onTypeChange() {
  const t = typeSel.value;
  fieldSets.forEach(group => {
    const active = group.dataset.type === t;
    group.classList.toggle('d-none', !active);
    group.querySelectorAll('input, textarea, select').forEach(f => {
      if (active && f.dataset.required === 'true') f.setAttribute('required', '');
      else f.removeAttribute('required');
    });
  });
  updateFinalUrlPreview();
  clearPreview('Choose content and generate a new QR code.');
}

typeSel.addEventListener('change', () => {
  onTypeChange();
  schedulePreviewUpdate();
});

onTypeChange();

function normalizeUrl(rawUrl) {
  const value = rawUrl.trim();
  if (!value) {
    return '';
  }

  const canonicalize = candidate => {
    const parsed = new URL(candidate);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.protocol}//${host}${path}${parsed.search}${parsed.hash}` || `${parsed.protocol}//${host}`;
  };

  try {
    return canonicalize(value);
  } catch {
    try {
      return canonicalize(`https://${value}`);
    } catch {
      return '';
    }
  }
}

function parseCustomParams(text) {
  const pairs = [];

  text.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=') !== -1 ? trimmed.indexOf('=') : trimmed.indexOf(':');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && value) {
      pairs.push([key, value]);
    }
  });

  return pairs;
}

/* ===== payload builder ===== */
function buildPayload(type, d) {
  switch (type) {
    case 'URL':
      return buildTrackedUrl(d);
    case 'TEXT':
      return d.text;
    case 'EMAIL':
      return `MATMSG:TO:${d.to};SUB:${d.subject};BODY:${d.body};;`;
    case 'VCARD': {
      const n = [d.ln, d.fn, d.additionalNames, d.prefix, d.suffix].join(';');
      const fn = d.formattedName || [d.prefix, d.fn, d.additionalNames, d.ln, d.suffix].filter(Boolean).join(' ');
      return [
        'BEGIN:VCARD', 'VERSION:3.0',
        `N:${n}`, `FN:${fn}`,
        d.org ? `ORG:${d.org}` : '',
        d.title ? `TITLE:${d.title}` : '',
        d.telWork ? `TEL;TYPE=work,voice,pref:${d.telWork}` : '',
        d.telCell ? `TEL;TYPE=cell:${d.telCell}` : '',
        d.telFax ? `TEL;TYPE=fax:${d.telFax}` : '',
        d.emailWork ? `EMAIL;TYPE=internet,work,pref:${d.emailWork}` : '',
        d.emailHome ? `EMAIL;TYPE=internet,home:${d.emailHome}` : '',
        d.vcardUrl ? `URL:${d.vcardUrl}` : '',
        d.adrStreet ? `ADR;TYPE=work:;;${d.adrStreet};${d.adrCity};${d.adrRegion};${d.adrPostal};${d.adrCountry}` : '',
        d.bday ? `BDAY:${d.bday}` : '',
        d.note ? `NOTE:${d.note}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\r\n');
    }
    case 'WIFI':
      return `WIFI:T:${d.enc};S:${d.ssid};P:${d.wifipw};H:${d.hidden};;`;
    default:
      return '';
  }
}

function buildTrackedUrl(d) {
  const baseUrl = normalizeUrl(d.url);
  if (!baseUrl) {
    return '';
  }

  if (!trackingEnable.checked) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  const params = new URLSearchParams(url.search);
  let hasTracking = false;

  const utmFields = [
    ['utm_source', d.utmSource],
    ['utm_medium', d.utmMedium],
    ['utm_campaign', d.utmCampaign],
    ['utm_content', d.utmContent],
    ['utm_term', d.utmTerm]
  ];

  utmFields.forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
      hasTracking = true;
    }
  });

  parseCustomParams(d.customParams).forEach(([key, value]) => {
    params.set(key, value);
    hasTracking = true;
  });

  url.search = params.toString() ? `?${params.toString()}` : '';
  return url.toString();
}

function getCurrentFormState() {
  const state = {
    type: typeSel.value,
    trackingEnable: trackingEnable.checked,
    embedMainUrl: embedMainUrl.checked,
    errorCorrection: errorCorrection.value,
    darkColor: darkColor.value,
    bgColor: bgColor.value,
    transparentBg: transparentBg.checked,
    logoDataUrl,
    logoFileName,
  };

  document.querySelectorAll('#qrForm [name]').forEach(field => {
    state[field.name] = field.type === 'checkbox' ? field.checked : field.value;
  });

  return state;
}

function setFieldValue(field, value) {
  if (field.type === 'checkbox') {
    field.checked = Boolean(value);
    return;
  }

  if (field.tagName === 'SELECT') {
    field.value = value ?? field.value;
    return;
  }

  field.value = value ?? '';
}

function applyFormState(state) {
  if (!state) {
    return;
  }

  if (state.type) {
    typeSel.value = state.type;
  }

  onTypeChange();

  document.querySelectorAll('#qrForm [name]').forEach(field => {
    if (Object.prototype.hasOwnProperty.call(state, field.name)) {
      setFieldValue(field, state[field.name]);
    }
  });

  setFieldValue(trackingEnable, state.trackingEnable);
  trackingPanel.classList.toggle('d-none', !trackingEnable.checked);
  setFieldValue(embedMainUrl, state.embedMainUrl);
  setFieldValue(errorCorrection, state.errorCorrection || 'M');
  setFieldValue(darkColor, state.darkColor || '#0f172a');
  setFieldValue(bgColor, state.bgColor || '#ffffff');
  setFieldValue(transparentBg, typeof state.transparentBg === 'boolean' ? state.transparentBg : true);
  logoDataUrl = state.logoDataUrl || '';
  logoFileName = state.logoFileName || '';
  logoName.textContent = logoFileName ? `Selected: ${logoFileName}` : '';
  updateFinalUrlPreview();
  schedulePreviewUpdate();
}

function renderRecentPresets() {
  if (!recentPresets) {
    return;
  }

  const presets = readRecentPresets();
  if (!presets.length) {
    recentPresets.innerHTML = '<div class="text-muted">No presets saved yet. Use the form controls and save one to reuse it later.</div>';
    return;
  }

  recentPresets.innerHTML = presets.map((preset, index) => {
    const savedAt = preset.savedAt ? new Date(preset.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'recently';
    return `
      <div class="preset-card">
        <strong>${escapeXml(preset.name || `Preset ${index + 1}`)}</strong>
        <span>${escapeXml(savedAt)} · ${escapeXml((preset.state && preset.state.type) || 'QR')}</span>
        <div class="preset-actions">
          <button type="button" class="btn btn-sm btn-primary" data-preset-load="${index}">Load</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" data-preset-delete="${index}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  recentPresets.querySelectorAll('[data-preset-load]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.presetLoad);
      const preset = readRecentPresets()[index];
      if (preset && preset.state) {
        applyFormState(preset.state);
        setStatus(`Loaded preset: ${preset.name || 'saved preset'}.`);
      }
    });
  });

  recentPresets.querySelectorAll('[data-preset-delete]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.presetDelete);
      const presets = readRecentPresets();
      presets.splice(index, 1);
      writeRecentPresets(presets);
      renderRecentPresets();
      setStatus('Preset removed.');
    });
  });
}

function getActiveData() {
  const type = typeSel.value;
  const data = {};
  document.querySelectorAll(`.field-group[data-type="${type}"] [name]`).forEach(field => {
    data[field.name] = field.type === 'checkbox' ? field.checked : field.value.trim();
  });
  return { type, data };
}

function hasMeaningfulInput(type, data) {
  switch (type) {
    case 'URL':
      return Boolean(data.url);
    case 'TEXT':
      return Boolean(data.text);
    case 'EMAIL':
      return Boolean(data.to || data.subject || data.body);
    case 'VCARD':
      return Boolean(data.fn || data.ln || data.formattedName || data.org || data.telWork || data.telCell || data.emailWork || data.vcardUrl);
    case 'WIFI':
      return Boolean(data.ssid);
    default:
      return false;
  }
}

function renderQr() {
  const renderId = ++renderToken;
  const { type, data } = getActiveData();
  updateFinalUrlPreview();

  if (!hasMeaningfulInput(type, data)) {
    clearPreview('Add details to preview your QR code.');
    return;
  }

  const text = buildPayload(type, data);
  if (!text) {
    clearPreview('Add details to preview your QR code.');
    return;
  }

  const embedLabelText = type === 'URL' && embedMainUrl.checked ? getEmbedLabel(data.url) : '';
  const style = getQrStyle();

  qrDiv.innerHTML = '';
  downloadBtns.classList.add('d-none');
  setStatus('Generating a high-contrast QR code...');

  const previewSize = 240;

  (async () => {
    const previewCanvas = await createCanvasOutput(text, embedLabelText, previewSize, style);
    if (renderId !== renderToken) {
      return;
    }

    if (!previewCanvas) {
      clearPreview('Unable to render the QR code.');
      return;
    }

    const previewImage = document.createElement('img');
    previewImage.src = previewCanvas.toDataURL('image/png');
    previewImage.alt = 'QR code preview';
    previewImage.style.display = 'block';
    qrDiv.replaceChildren(previewImage);

    const highResSize = 1200;
    const highCanvas = await createCanvasOutput(text, embedLabelText, highResSize, style);
    if (renderId !== renderToken) {
      return;
    }

    if (highCanvas) {
      const pngHigh = highCanvas.toDataURL('image/png');
      const btnPng = document.getElementById('btnPng');
      btnPng.href = pngHigh;
      btnPng.download = 'qr-code-1200.png';
    }

    const svgStr = createSvgWithDecorations(text, embedLabelText, highResSize, style);
    if (currentSvgUrl) {
      URL.revokeObjectURL(currentSvgUrl);
    }
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
    currentSvgUrl = URL.createObjectURL(svgBlob);
    const btnSvg = document.getElementById('btnSvg');
    btnSvg.href = currentSvgUrl;
    btnSvg.download = 'qr-code.svg';

    downloadBtns.classList.remove('d-none');
    setStatus('Ready to download as PNG or SVG.');

    if (window.innerWidth < 992) {
      previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  })().catch(() => {
    if (renderId === renderToken) {
      clearPreview('Unable to render the QR code.');
    }
  });
}

function schedulePreviewUpdate() {
  window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(renderQr, 250);
  updateFinalUrlPreview();
}

function syncGeneratorUi() {
  trackingPanel.classList.toggle('d-none', !trackingEnable.checked);
  bgColor.disabled = transparentBg.checked;
  updateFinalUrlPreview();
}

trackingEnable.addEventListener('change', () => {
  syncGeneratorUi();
  schedulePreviewUpdate();
});

trackingPanel.addEventListener('input', () => {
  if (!trackingEnable.checked) {
    trackingEnable.checked = true;
    trackingPanel.classList.remove('d-none');
  }
  updateFinalUrlPreview();
  schedulePreviewUpdate();
});

embedMainUrl.addEventListener('change', () => {
  schedulePreviewUpdate();
});

transparentBg.addEventListener('change', () => {
  syncGeneratorUi();
  schedulePreviewUpdate();
});

logoUpload.addEventListener('change', () => {
  const file = logoUpload.files && logoUpload.files[0];
  if (!file) {
    logoDataUrl = '';
    logoFileName = '';
    logoName.textContent = '';
    schedulePreviewUpdate();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    logoDataUrl = String(reader.result || '');
    logoFileName = file.name;
    logoName.textContent = `Selected: ${logoFileName}`;
    schedulePreviewUpdate();
  };
  reader.readAsDataURL(file);
});

clearLogoBtn.addEventListener('click', () => {
  logoUpload.value = '';
  logoDataUrl = '';
  logoFileName = '';
  logoName.textContent = '';
  schedulePreviewUpdate();
});

templateButtons.forEach(button => {
  button.addEventListener('click', () => {
    const template = CAMPAIGN_TEMPLATES[button.dataset.template];
    if (!template) {
      return;
    }

    trackingEnable.checked = true;
    trackingPanel.classList.remove('d-none');
    Object.entries(template).forEach(([key, value]) => {
      const field = document.getElementById(key);
      if (field) {
        field.value = value;
      }
    });

    templateButtons.forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');
    updateFinalUrlPreview();
    schedulePreviewUpdate();
    setStatus(`Applied ${button.textContent.trim()} template.`);
  });
});

savePresetBtn.addEventListener('click', () => {
  const name = (presetName.value || '').trim() || `${typeSel.value} preset`;
  const presets = readRecentPresets();
  presets.unshift({
    name,
    savedAt: new Date().toISOString(),
    state: getCurrentFormState(),
  });
  writeRecentPresets(presets);
  presetName.value = '';
  renderRecentPresets();
  setStatus(`Saved preset: ${name}.`);
});

copyUrlBtn.addEventListener('click', async () => {
  const payload = finalUrlPreview.value || buildTrackedUrl(getActiveData().data);
  if (!payload) {
    setStatus('Add a URL before copying it.', true);
    return;
  }

  try {
    await navigator.clipboard.writeText(payload);
    setStatus('Final URL copied to clipboard.');
  } catch {
    setStatus('Copy failed in this browser. Try selecting the URL manually.', true);
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  updateFinalUrlPreview();
  renderQr();
});

form.addEventListener('input', () => {
  updateFinalUrlPreview();
  schedulePreviewUpdate();
});

copyBtn.addEventListener('click', async () => {
  const { type, data } = getActiveData();
  const text = buildPayload(type, data);

  if (!hasMeaningfulInput(type, data) || !text) {
    setStatus('Add content before copying the payload.', true);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Payload copied to clipboard.');
  } catch {
    setStatus('Copy failed in this browser. Try selecting the payload manually.', true);
  }
});

syncGeneratorUi();
renderRecentPresets();

window.addEventListener('pageshow', syncGeneratorUi);
