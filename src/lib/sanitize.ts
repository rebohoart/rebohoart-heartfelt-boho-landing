import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['strong', 'br', 'a', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'style', 'colspan'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Escapes HTML special characters to prevent XSS
 * Use this for plain text that should not contain any HTML
 * @param text - The text to escape
 * @returns Escaped text safe for HTML context
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns Object with isValid boolean and optional error message
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `O ficheiro ${file.name} é muito grande. Tamanho máximo: 5MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `O ficheiro ${file.name} não é uma imagem válida. Formatos permitidos: JPG, PNG, GIF, WebP, SVG`,
    };
  }

  // Check file extension as an additional safeguard
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

  if (!extension || !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `O ficheiro ${file.name} tem uma extensão inválida`,
    };
  }

  return { isValid: true };
};
