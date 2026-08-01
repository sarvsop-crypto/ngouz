const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'caption', 'cite', 'code',
  'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
  'figure', 'footer', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr',
  'i', 'img', 'ins', 'kbd', 'li', 'line', 'main', 'mark', 'nav', 'ol', 'p', 'path',
  'picture', 'polygon', 'polyline', 'pre', 'q', 'rect', 's', 'section', 'small',
  'source', 'span', 'strong', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody',
  'td', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'use',
]);

const GLOBAL_ATTRIBUTES = new Set([
  'alt', 'class', 'colspan', 'datetime', 'height', 'lang', 'rel', 'role', 'rowspan',
  'scope', 'target', 'title', 'width',
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
  if (name === 'src' || name === 'srcset') return tag === 'img' || tag === 'source';
  return false;
}

function attributeValueAllowed(name, value, tag) {
  if (name === 'target') return value === '_blank' || value === '_self';
  if (name === 'href' || name === 'xlink:href') {
    if (tag === 'use') return /^#[A-Za-z][A-Za-z0-9_.:-]*$/.test(value);
    return safeLink(value);
  }
  if (name === 'src') return safeImage(value);
  if (name === 'srcset') {
    return value.split(',').every((part) => safeImage(part.trim().split(/\s+/, 1)[0] || ''));
  }
  return true;
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
