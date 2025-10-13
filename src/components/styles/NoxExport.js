import SteriaTheme from './SteriaTheme.js';
import fs from 'node:fs';

fs.writeFile('./NoxExport.json', JSON.stringify(SteriaTheme), () => undefined);
