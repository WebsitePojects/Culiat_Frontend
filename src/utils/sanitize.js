/**
 * HTML Sanitization Utility
 * Provides safe HTML rendering to prevent XSS attacks.
 * 
 * This is a lightweight sanitizer for cases where dangerouslySetInnerHTML is needed.
 * For production, consider installing DOMPurify: npm install dompurify
 */

/**
 * Sanitize HTML string by removing dangerous elements and attributes.
 * Allows basic formatting tags while stripping scripts, event handlers, etc.
 * 
 * @param {string} dirty - Untrusted HTML string
 * @returns {string} Sanitized HTML safe for rendering
 */
export function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  // Decode legacy HTML entities first (e.g. &lt;b&gt;...&lt;/b&gt; from backend encoding)
  // so valid rich text can be sanitized and rendered correctly.
  const decoder = document.createElement('textarea');
  decoder.innerHTML = dirty;
  const decodedInput = decoder.value;

  // Create a temporary DOM element
  const doc = new DOMParser().parseFromString(decodedInput, 'text/html');
  
  // Remove all script elements
  const scripts = doc.querySelectorAll('script, noscript');
  scripts.forEach(el => el.remove());

  // Remove all event handler attributes and dangerous attributes
  const allElements = doc.body.querySelectorAll('*');
  const dangerousAttrs = [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 
    'onmousedown', 'onmouseup', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'oncontextmenu',
    'ondblclick', 'oninput', 'onscroll', 'onresize', 'onanimationend',
    'ontouchstart', 'ontouchend', 'ontouchmove',
  ];

  // Allowed tags (safe formatting tags)
  // NOTE: 'font' is required for execCommand('foreColor') in legacy browsers
  const allowedTags = new Set([
    'p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
    'span', 'div', 'font', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'img', 'hr', 'sub', 'sup', 'mark', 'small', 'del', 'ins',
  ]);

  // Attributes allowed per tag (in addition to universal safe attrs)
  const allowedAttrs = new Set(['class', 'id', 'style', 'align', 'color', 'size', 'face',
    'href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan',
    'target', 'rel', 'type', 'start', 'reversed',
  ]);

  allElements.forEach(el => {
    // Remove elements not in allowed list
    if (!allowedTags.has(el.tagName.toLowerCase())) {
      // Keep text content, remove the element itself
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      return;
    }

    // Remove dangerous attributes, keep safe ones
    const attrs = Array.from(el.attributes);
    attrs.forEach(attr => {
      const name = attr.name.toLowerCase();
      // Always remove event handlers
      if (name.startsWith('on') || dangerousAttrs.includes(name)) {
        el.removeAttribute(attr.name);
        return;
      }
      // Remove javascript: URLs
      if (['href', 'src', 'action', 'formaction', 'xlink:href'].includes(name)) {
        const value = attr.value.trim().toLowerCase();
        if (value.startsWith('javascript:') || value.startsWith('data:text') || value.startsWith('vbscript:')) {
          el.removeAttribute(attr.name);
          return;
        }
      }
      // Remove style attributes that could contain script expressions
      if (name === 'style' && /expression\s*\(|javascript:|vbscript:/i.test(attr.value)) {
        el.removeAttribute(attr.name);
        return;
      }
      // Remove unknown attributes not in the safe list
      if (!allowedAttrs.has(name)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

/**
 * Create props for dangerouslySetInnerHTML with sanitization
 * Usage: <div {...createSafeHTML(htmlContent)} />
 * 
 * @param {string} html - Untrusted HTML string
 * @returns {{ dangerouslySetInnerHTML: { __html: string } }}
 */
export function createSafeHTML(html) {
  return {
    dangerouslySetInnerHTML: { __html: sanitizeHTML(html) }
  };
}
