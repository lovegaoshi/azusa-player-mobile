import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
  hexFromArgb,
} from '@material/material-color-utilities';

const convertColor = color => {
  if (typeof color === 'object') {
    const newColor = {};
    Object.keys(color).forEach(k => (newColor[k] = convertColor(color[k])));
    return newColor;
  }
  try {
    return hexFromArgb(color);
  } catch {
    return color;
  }
};

// Get the theme from a hex color
const theme = themeFromSourceColor(argbFromHex('#FFFF00'), [
  {
    name: 'custom-1',
    value: argbFromHex('#ff0000'),
    blend: true,
  },
]);
console.log(JSON.stringify(convertColor(theme), null, 2));
