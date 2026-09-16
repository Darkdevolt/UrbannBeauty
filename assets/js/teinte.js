/* ============================================
   URBANN BEAUTY — Diagnostic teint (fonds de teint)
   Capture une couleur de peau depuis une photo et la compare aux teintes
   des produits (product.shadeHex, renseigne depuis l'admin) pour proposer
   les fonds de teint les plus proches. Tout se passe dans le navigateur du
   client : aucune photo n'est jamais envoyee ni stockee.
   ============================================ */

function ubHexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function ubRgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

/* sRGB -> CIE Lab (illuminant D65), pour comparer des couleurs comme l'oeil humain
   le fait plutot qu'en distance RGB brute (peu fiable pour les tons de peau). */
function ubRgbToLab({ r, g, b }) {
  const toLinear = v => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; };
  const R = toLinear(r), G = toLinear(g), B = toLinear(b);
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.0;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}
function ubDeltaE(hexA, hexB) {
  const a = ubRgbToLab(ubHexToRgb(hexA)), b = ubRgbToLab(ubHexToRgb(hexB));
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}
/* Convertit un ecart Lab en pourcentage de correspondance facile a lire pour
   une cliente (0 = tres different, 100 = identique). Seuils calibres a la main :
   deltaE ~2-3 est deja imperceptible a l'oeil, ~15+ est une teinte nettement differente. */
function ubMatchPercent(deltaE) {
  return Math.max(0, Math.round(100 - deltaE * 2.2));
}

/* Dessine une image (File) dans un canvas, mise a l'echelle pour tenir dans maxSize,
   et renvoie le contexte pret pour l'echantillonnage. */
function ubDrawPhotoToCanvas(file, canvas, maxSize = 480) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image illisible')); };
    img.src = url;
  });
}

/* Moyenne les pixels dans un rayon autour du point tape par la cliente : plus fiable
   qu'un pixel unique (evite un grain de peau, un reflet ou un pixel de compression). */
function ubSampleColorAt(canvas, x, y, radius = 14) {
  const ctx = canvas.getContext('2d');
  const x0 = Math.max(0, Math.round(x - radius)), y0 = Math.max(0, Math.round(y - radius));
  const size = radius * 2;
  const w = Math.min(size, canvas.width - x0), h = Math.min(size, canvas.height - y0);
  const { data } = ctx.getImageData(x0, y0, Math.max(1, w), Math.max(1, h));
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  return ubRgbToHex({ r: r / n, g: g / n, b: b / n });
}

/* Classe les produits qui ont une teinte de reference (shadeHex, renseignee en admin)
   par ressemblance decroissante avec la couleur de peau captee. */
function ubFindShadeMatches(sampledHex, products) {
  return products
    .filter(p => p.shadeHex)
    .map(p => ({ product: p, deltaE: ubDeltaE(sampledHex, p.shadeHex), match: ubMatchPercent(ubDeltaE(sampledHex, p.shadeHex)) }))
    .sort((a, b) => a.deltaE - b.deltaE);
}
