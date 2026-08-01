const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'button', 'caption', 'circle', 'cite', 'code',
  'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
  'figure', 'footer', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr',
  'i', 'iframe', 'img', 'ins', 'kbd', 'li', 'line', 'main', 'mark', 'nav', 'ol', 'p', 'path',
  'picture', 'polygon', 'polyline', 'pre', 'q', 'rect', 's', 'section', 'small',
  'source', 'span', 'strong', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody',
  'td', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'use',
]);

const GLOBAL_ATTRIBUTES = new Set([
  'allowfullscreen', 'alt', 'class', 'colspan', 'datetime', 'decoding', 'focusable',
  'height', 'id', 'lang', 'loading', 'referrerpolicy', 'rel', 'role', 'rowspan',
  'sandbox', 'scope', 'style', 'target', 'title', 'type', 'width',
]);

const SVG_ATTRIBUTES = new Set([
  'cx', 'cy', 'd', 'fill', 'height', 'points', 'preserveaspectratio', 'r', 'rx', 'ry',
  'stroke', 'stroke-linecap', 'stroke-linejoin', 'stroke-width', 'viewbox', 'width',
  'x', 'x1', 'x2', 'y', 'y1', 'y2',
]);

export async function sanitizeHtml(value) {
  const html = String(value || '');
  if (!html) return '';

  const rewriter = new HTMLRewriter().on('*', {
    element(element) {
      const tag = String(element.tagName || '').toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        element.remove();
        return;
      }

      for (const [rawName, rawValue] of Array.from(element.attributes)) {
        const name = String(rawName || '').toLowerCase();
        const value = String(rawValue || '');
        if (!attributeAllowed(name, tag) || !attributeValueAllowed(name, value, tag)) {
          element.removeAttribute(rawName);
        }
      }

      if (tag === 'iframe') {
        if (!element.getAttribute('src')) {
          element.remove();
          return;
        }
        element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
        element.setAttribute('referrerpolicy', 'no-referrer');
      }

      if (tag === 'a' && element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    },
  });

  return rewriter.transform(new Response(html)).text();
}

function attributeAllowed(name, tag) {
  if (GLOBAL_ATTRIBUTES.has(name) || SVG_ATTRIBUTES.has(name)) return true;
  if (name.startsWith('aria-') || name.startsWith('data-')) return true;
  if (name === 'href') return tag === 'a' || tag === 'use';
  if (name === 'xlink:href') return tag === 'use';
  if (name === 'src') return tag === 'img' || tag === 'source' || tag === 'iframe';
  if (name === 'srcset') return tag === 'img' || tag === 'source';
  return false;
}

function attributeValueAllowed(name, value, tag) {
  if (name === 'target') return value === '_blank' || value === '_self';
  if (name === 'id') return /^[A-Za-z][A-Za-z0-9_.:-]{0,120}$/.test(value);
  if (name === 'type') return tag === 'button' && value === 'button';
  if (name === 'style') return safeStyle(value);
  if (name === 'loading') return value === 'lazy' || value === 'eager';
  if (name === 'decoding') return value === 'async' || value === 'sync' || value === 'auto';
  if (name === 'referrerpolicy') {
    return ['no-referrer', 'origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'no-referrer-when-downgrade'].includes(value);
  }
  if (name === 'sandbox') return safeSandbox(value);
  if (name === 'href' || name === 'xlink:href') {
    if (tag === 'use') return /^#[A-Za-z][A-Za-z0-9_.:-]*$/.test(value);
    return safeLink(value);
  }
  if (name === 'src') return tag === 'iframe' ? safeFrame(value) : safeImage(value);
  if (name === 'srcset') {
    return value.split(',').every((part) => safeImage(part.trim().split(/\s+/, 1)[0] || ''));
  }
  return true;
}

const ALLOWED_STYLE_PROPERTIES = new Set([
  'align-items', 'background', 'border', 'border-radius', 'color', 'display',
  'flex-shrink', 'flex-wrap', 'font-size', 'font-weight', 'gap', 'grid-column',
  'height', 'justify-content', 'line-height', 'margin', 'margin-bottom',
  'margin-right', 'margin-top', 'max-width', 'opacity', 'padding', 'padding-left',
  'text-align', 'text-decoration', 'vertical-align', 'white-space', 'width',
]);

function safeStyle(value) {
  const declarations = String(value || '').split(';').filter(Boolean);
  if (!declarations.length) return false;
  return declarations.every((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 1) return false;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const propertyValue = declaration.slice(separator + 1).trim();
    return ALLOWED_STYLE_PROPERTIES.has(property)
      && propertyValue.length <= 200
      && /^[#(),.%\-A-Za-z0-9_\s]+$/.test(propertyValue);
  });
}

function safeSandbox(value) {
  const allowed = new Set([
    'allow-forms', 'allow-modals', 'allow-popups', 'allow-popups-to-escape-sandbox',
    'allow-same-origin', 'allow-scripts', 'allow-top-navigation-by-user-activation',
  ]);
  return String(value || '').split(/\s+/).filter(Boolean).every((token) => allowed.has(token));
}

function safeFrame(value) {
  const v = cleanUrlValue(value);
  if (!v || v.includes('\\')) return '';
  try {
    const url = new URL(v);
    return url.protocol === 'https:' && (url.hostname === 'yandex.uz' || url.hostname.endsWith('.yandex.uz')) ? v : '';
  } catch {
    return '';
  }
}

export function safeLink(value) {
  const v = cleanUrlValue(value);
  if (!v || v.startsWith('//') || v.includes('\\')) return '';
  return v.startsWith('/') || v.startsWith('#') || v.startsWith('./') || v.startsWith('../')
    || /^https:\/\//i.test(v) || /^mailto:/i.test(v) || /^tel:/i.test(v) ? v : '';
}

export function safeImage(value) {
  const v = cleanUrlValue(value);
  if (!v || v.startsWith('//') || v.includes('\\')) return '';
  return v.startsWith('/') || v.startsWith('./') || v.startsWith('../')
    || /^https:\/\//i.test(v) || /^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(v) ? v : '';
}

function cleanUrlValue(value) {
  const v = String(value || '').trim().slice(0, 2000);
  return /[\u0000-\u001F\u007F]/.test(v) ? '' : v;
}
