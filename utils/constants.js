import { glThemes as glThemesVariable } from '../scss_to_js/scss_variables'; // eslint-disable-line import/no-unresolved

function appendDefaultOption(options) {
  return Object.assign({}, options, {
    default: '',
  });
}

export const glThemes = glThemesVariable.split(',').map(glTheme => glTheme.trim());

export const variantOptions = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  light: 'light',
  dark: 'dark',
};

export const targetOptions = ['_self', '_blank', '_parent', '_top', null];

export const sizeOptions = {
  default: null,
  sm: 'sm',
  lg: 'lg',
};

export const labelSizeOptions = {
  default: null,
  sm: 'sm',
};

export const labelColorOptions = {
  dark: 'dark',
  light: 'light',
};

export const avatarSizeOptions = [96, 64, 48, 32, 24, 16];

export const avatarShapeOptions = {
  circle: 'circle',
  rect: 'rect',
};

export const formStateOptions = {
  default: null,
  valid: 'valid',
  invalid: 'invalid',
};

export const buttonVariantOptions = {
  default: null,
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  'outline-info': 'outline-info',
  'outline-success': 'outline-success',
  'outline-warning': 'outline-warning',
  'outline-danger': 'outline-danger',
};

export const newButtonCategoryOptions = {
  tertiary: 'tertiary',
  primary: 'primary',
  secondary: 'secondary',
};

export const newButtonVariantOptions = {
  default: 'default',
  dashed: 'dashed',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  link: 'link',
};

export const newDropdownVariantOptions = {
  default: 'default',
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export const newButtonSizeOptions = {
  small: 'small',
  medium: 'medium',
};

export const newButtonSizeOptionsMap = {
  small: 'sm',
  medium: 'md',
};

export const triggerVariantOptions = {
  click: 'click',
  hover: 'hover',
  focus: 'focus',
};

export const tooltipPlacements = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
};

export const popoverPlacements = {
  top: 'top',
  topleft: 'topleft',
  topright: 'topright',
  right: 'right',
  righttop: 'righttop',
  rightbottom: 'rightbottom',
  bottom: 'bottom',
  bottomleft: 'bottomleft',
  bottomright: 'bottomright',
  left: 'left',
  lefttop: 'lefttop',
  leftbottom: 'leftbottom',
};

export const columnOptions = {
  stacked: 'stacked',
  tiled: 'tiled',
};

export const alignOptions = {
  left: 'left',
  center: 'center',
  right: 'right',
  fill: 'fill',
};

export const resizeDebounceTime = 200;

export const variantOptionsWithNoDefault = appendDefaultOption(variantOptions);
export const sizeOptionsWithNoDefault = appendDefaultOption(sizeOptions);

// Datetime constants
export const defaultDateFormat = 'YYYY-MM-DD';
