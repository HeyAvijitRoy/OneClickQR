/* ===== DOM short-cuts ===== */
const typeSel   = document.getElementById('type');
const fieldSets = document.querySelectorAll('.field-group');
const form      = document.getElementById('qrForm');
const qrDiv     = document.getElementById('qrContainer');

/* ===== UI helper ===== */
function onTypeChange() {
  const t = typeSel.value;
  fieldSets.forEach(group => {
    const active = group.dataset.type === t;
    group.classList.toggle('d-none', !active);
    group.querySelectorAll('input, textarea, select').forEach(f => {
      if (active && f.name) f.setAttribute('required','');
      else f.removeAttribute('required');
    });
  });
  qrDiv.innerHTML = '';
  document.getElementById('downloadBtns').style.display = 'none';
}
typeSel.addEventListener('change', onTypeChange);
onTypeChange();

/* ===== payload builder ===== */
function buildPayload(type, d) {
  switch (type) {
    case 'URL':   return d.url;
    case 'TEXT':  return d.text;
    case 'EMAIL': return `MATMSG:TO:${d.to};SUB:${d.subject};BODY:${d.body};;`;
    case 'VCARD': {
      const n  = [d.ln,d.fn,d.additionalNames,d.prefix,d.suffix].join(';');
      const fn = d.formattedName || [d.prefix,d.fn,d.additionalNames,d.ln,d.suffix]
                   .filter(Boolean).join(' ');
      return [
        'BEGIN:VCARD','VERSION:3.0',
        `N:${n}`,`FN:${fn}`,
        d.org      ?`ORG:${d.org}`:'',
        d.title    ?`TITLE:${d.title}`:'',
        d.telWork  ?`TEL;TYPE=work,voice,pref:${d.telWork}`:'',
        d.telCell  ?`TEL;TYPE=cell:${d.telCell}`:'',
        d.telFax   ?`TEL;TYPE=fax:${d.telFax}`:'',
        d.emailWork?`EMAIL;TYPE=internet,work,pref:${d.emailWork}`:'',
        d.emailHome?`EMAIL;TYPE=internet,home:${d.emailHome}`:'',
        d.vcardUrl ?`URL:${d.vcardUrl}`:'',
        d.adrStreet?`ADR;TYPE=work:;;${d.adrStreet};${d.adrCity};${d.adrRegion};${d.adrPostal};${d.adrCountry}`:'',
        d.bday     ?`BDAY:${d.bday}`:'',
        d.note     ?`NOTE:${d.note}`:'',
        'END:VCARD'
      ].filter(Boolean).join('\r\n');
    }
    case 'WIFI':
      return `WIFI:T:${d.enc};S:${d.ssid};P:${d.wifipw};H:${d.hidden};;`;
  }
}

/* ===== main generator ===== */
form.addEventListener('submit', e => {
  e.preventDefault();
  qrDiv.innerHTML = '';
  const btnBox = document.getElementById('downloadBtns');
  btnBox.style.display = 'none';

  // collect data
  const type = typeSel.value;
  const d = {};
  document.querySelectorAll(`.field-group[data-type="${type}"] [name]`)
    .forEach(f => d[f.name] = f.type==='checkbox'?f.checked:f.value.trim());

  const text = buildPayload(type, d);

  // render PNG with transparent background
  new QRCodeCanvas(qrDiv, {
    text,
    width: 220,
    height: 220,
    correctLevel: QRCodeCanvas.CorrectLevel.M,
    colorDark: "#000000",
    colorLight: "rgba(0,0,0,0)"
  });

  // once canvas exists, setup downloads
  requestAnimationFrame(() => {
    const canvas = qrDiv.querySelector('canvas');
    if (!canvas) return;

   // —— HIGH-RES PNG GENERATION (1200×1200) —— 
   const highResSize = 1200;
   // create off-DOM container
   const tmpDiv = document.createElement('div');
   new QRCodeCanvas(tmpDiv, {
     text,
     width: highResSize,
     height: highResSize,
     correctLevel: QRCodeCanvas.CorrectLevel.M,
     colorDark: "#000000",
     colorLight: "rgba(0,0,0,0)"
   });
   const highCanvas = tmpDiv.querySelector('canvas');
   if (highCanvas) {
     const pngHigh = highCanvas.toDataURL('image/png');
     const btnPng  = document.getElementById('btnPng');
     btnPng.href    = pngHigh;
     btnPng.download= 'qr-code-1200.png';
   }

    // SVG
    const svgStr = new QRCodeSVG({
      content: text,
      padding: 0,
      width:   220,
      height:  220,
      ecl:     'M'
    }).svg();
    const svgBlob = new Blob([svgStr], { type:'image/svg+xml' });
    const svgUrl  = URL.createObjectURL(svgBlob);
    const btnSvg  = document.getElementById('btnSvg');
    btnSvg.href    = svgUrl;
    btnSvg.download= 'qr-code.svg';

    btnBox.style.display = 'flex';
    // mobile scroll
    if (window.innerWidth < 992) {
      document.querySelector('.preview-card')
              .scrollIntoView({ behavior:'smooth' });
    }
  });
});
