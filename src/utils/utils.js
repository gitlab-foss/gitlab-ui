import { labelColorOptions, focusableTags } from './constants';

export function debounceByAnimationFrame(fn) {
  let requestId;

  return function debounced(...args) {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
    }
    requestId = window.requestAnimationFrame(() => fn.apply(this, args));
  };
}

export function throttle(fn) {
  let frameId = null;

  return (...args) => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      fn(...args);
      frameId = null;
    });
  };
}

export function rgbFromHex(hex) {
  const cleanHex = hex.replace('#', '');
  const rgb =
    cleanHex.length === 3
      ? cleanHex.split('').map((val) => val + val)
      : cleanHex.match(/[\da-f]{2}/gi);
  const [r, g, b] = rgb.map((val) => parseInt(val, 16));
  return [r, g, b];
}

export function rgbFromString(color, sub) {
  const rgb = color.substring(sub, color.length - 1).split(',');
  const [r, g, b] = rgb.map((i) => parseInt(i, 10));
  return [r, g, b];
}

export function hexToRgba(hex, opacity = 1) {
  const [r, g, b] = rgbFromHex(hex);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function colorFromBackground(backgroundColor) {
  let r;
  let g;
  let b;

  if (backgroundColor.startsWith('#')) {
    [r, g, b] = rgbFromHex(backgroundColor);
  } else if (backgroundColor.startsWith('rgba(')) {
    [r, g, b] = rgbFromString(backgroundColor, 5);
  } else if (backgroundColor.startsWith('rgb(')) {
    [r, g, b] = rgbFromString(backgroundColor, 4);
  }

  if (r + g + b <= 500) {
    return labelColorOptions.light;
  }
  return labelColorOptions.dark;
}

export function uid() {
  return Math.random().toString(36).substring(2);
}

/**
 * Receives an element and validates that it can be focused
 * @param { HTMLElement } The element we want to validate
 * @return { boolean } Is the element focusable
 */

export function isElementFocusable(elt) {
  if (!elt) return false;

  const { tagName } = elt;

  const isValidTag = focusableTags.includes(tagName);
  const hasValidType = elt.getAttribute('type') !== 'hidden';
  const isDisabled = elt.getAttribute('disabled') === '' || elt.getAttribute('disabled');
  const hasValidZIndex = elt.getAttribute('z-index') !== '-1';
  const isInvalidAnchorTag = tagName === 'A' && !elt.getAttribute('href');

  return isValidTag && hasValidType && !isDisabled && hasValidZIndex && !isInvalidAnchorTag;
}

/**
 * Receives an array of HTML elements and focus the first one possible
 * @param { Array.<HTMLElement> } An array of element to potentially focus
 * @return { undefined }
 */

export function focusFirstFocusableElement(elts) {
  const focusableElt = elts.find((el) => isElementFocusable(el));

  if (focusableElt) focusableElt.focus();
}

/**
 * Prints a warning message to the console
 * @param {string} message An array of element to potentially focus
 */
export function deprecationWarning(message = '') {
  if (message.length) {
    if (!['test', 'production'].includes(process.env.NODE_ENV)) {
      /* eslint-disable-next-line no-console */
      console.warn(message);
    }
  }
}
