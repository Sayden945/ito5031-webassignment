/**
 * Composable for sanitizing HTML content to prevent XSS attacks
 * Uses DOMPurify to safely render user-generated content
 */

import DOMPurify from 'dompurify'

export function useSanitize() {
  /**
   * Sanitize HTML content for safe rendering
   * @param {string} dirty - Potentially unsafe HTML content
   * @param {object} options - DOMPurify configuration options
   * @returns {string} Sanitized HTML safe for rendering
   */
  const sanitizeHtml = (dirty, options = {}) => {
    if (!dirty || typeof dirty !== 'string') {
      return ''
    }

    // Default safe configuration
    const defaultConfig = {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'code',
        'pre',
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: true,
    }

    const config = { ...defaultConfig, ...options }

    return DOMPurify.sanitize(dirty, config)
  }

  /**
   * Sanitize plain text input (removes all HTML)
   * @param {string} input - User input text
   * @returns {string} Plain text with all HTML stripped
   */
  const sanitizeText = (input) => {
    if (!input || typeof input !== 'string') {
      return ''
    }

    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true,
    })
  }

  /**
   * Sanitize URL to prevent javascript: and data: protocols
   * @param {string} url - URL to sanitize
   * @returns {string} Safe URL or empty string if invalid
   */
  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return ''
    }

    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:']

    try {
      const urlObj = new URL(url, window.location.origin)
      if (allowedProtocols.includes(urlObj.protocol)) {
        return url
      }
    } catch {
      // Invalid URL
      return ''
    }

    return ''
  }

  return {
    sanitizeHtml,
    sanitizeText,
    sanitizeUrl,
  }
}
