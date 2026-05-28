// ============================================
// FRONTEND UTILITIES
// Security and helper functions
// ============================================

// Sanitize HTML to prevent XSS attacks
const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'input', 'label', 'select', 'option', 'form', 'img', 'a'],
    ALLOWED_ATTR: ['class', 'id', 'type', 'value', 'placeholder', 'required', 'disabled', 'checked', 'selected', 'src', 'alt', 'href', 'target', 'onclick', 'onchange', 'onsubmit', 'style', 'data-*'],
    ALLOW_DATA_ATTR: true
  });
};

// Safe innerHTML setter
const setInnerHTML = (element, html) => {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.innerHTML = sanitizeHTML(html);
  }
};

// Validate and sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>'"&]/g, (char) => {
    const entityMap = {
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#x27;',
      '"': '&quot;',
      '&': '&amp;'
    };
    return entityMap[char];
  });
};

// Export utilities
window.AFUtils = {
  sanitizeHTML,
  setInnerHTML,
  sanitizeInput
};