import { sanitize } from 'dompurify';

const DEFAULT_CONFIG = { RETURN_DOM_FRAGMENT: true };

const transform = (el, binding) => {
  if (binding.oldValue !== binding.value) {
    const config = { ...DEFAULT_CONFIG, ...(binding.arg ?? {}) };

    el.textContent = '';
    el.appendChild(sanitize(binding.value, config));
  }
};

const SafeHtmlDirective = {
  bind: transform,
  update: transform,
};

export default SafeHtmlDirective;
