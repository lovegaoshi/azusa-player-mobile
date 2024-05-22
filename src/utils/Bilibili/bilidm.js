import { encode as btoa } from 'js-base64';

const { floor, random } = Math;

function f114i(a, b, i) {
  const t = floor(random() * (114 * i));
  return [3 * a + 2 * b + t, 4 * a - 5 * b + t, t];
}

function f114(a, b) {
  const t = floor(random() * 114);
  return [2 * a + 2 * b + 3 * t, 4 * a - b + t, t];
}

function f514(a, b) {
  const t = floor(random() * 514);
  return [3 * a + 2 * b + t, 4 * a - 4 * b + 2 * t, t];
}

const eventTypes = ['mousemove', 'click'];

/**
 * @param {Iterable<MouseEvent>} events 最近 50 次 `mousemove` 和 `click` 事件。
 * @returns {string} `dm_img_list` 的值。
 */
export function getDmImgList(events) {
  return JSON.stringify(
    Array.from(events, (event, index) => {
      const [x, y, z] = f114i(event.x, event.y, index);
      return {
        x,
        y,
        z,
        timestamp: floor(event.timeStamp),
        k: floor(random() * 67) + 60,
        type: eventTypes.indexOf(event.type),
      };
    })
  );
}

const tagNames = [
  'span',
  'div',
  'p',
  'a',
  'img',
  'input',
  'button',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'form',
  'textarea',
  'select',
  'option',
  'table',
  'tr',
  'td',
  'th',
  'label',
  'strong',
  'em',
  'section',
  'article',
];

/**
 * @param {DOMRectReadOnly} windowBounds
 *   初始全零，窗口大小和滚动位置都没变则保持全零；
 *   窗口大小改变时 `width` 和 `height` 属性分别更新为 `innerWidth` 和 `innerHeight`；
 *   滚动位置改变时 `x` 和 `y` 属性分别更新为 `scrollX` 和 `scrollY`。
 * @param {Iterable<Element>} elements
 *   初值是 `document.querySelectorAll("div[data-v-risk=fingerprint]")` 返回的两个元素；
 *   `mousemove` 或 `click` 时更新为只含事件的 `target` 一个元素。
 * @returns {string} `dm_img_inter` 的值。
 */
export function getDmImgInter(windowBounds, elements) {
  return JSON.stringify({
    ds: Array.from(elements, element => {
      const bounds = element.getBoundingClientRect();
      const [x1, y1, z1] = f114(bounds.y | 0, bounds.x | 0);
      const [x2, y2, z2] = f514(bounds.width | 0, bounds.height | 0);
      return {
        t: tagNames.indexOf(element.tagName.toLowerCase()) + 1,
        c: btoa(element.className).slice(0, -2),
        p: [x1, z1, y1],
        s: [z2, x2, y2],
      };
    }),
    wh: f114(windowBounds.width, windowBounds.height),
    of: f514(windowBounds.y, windowBounds.x),
  });
}

function randomSample(population, sampleSize) {
  if (sampleSize > population.length) {
    throw new Error('Sample size exceeds population size');
  }

  const shuffled = population.slice(0);
  let i = population.length;
  let temp, index;

  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }

  return shuffled.slice(0, sampleSize);
}

export const getDm = () => {
  const dm_rand = 'ABCDEFGHIJK'.split('');
  const dm_img_list = '[]';
  const dm_img_str = randomSample(dm_rand, 2).join('');
  const dm_cover_img_str = randomSample(dm_rand, 2).join('');
  const dm_img_inter = '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}';
  return Object.entries({
    dm_img_list,
    dm_img_str,
    dm_cover_img_str,
    dm_img_inter,
  }).reduce((arr, curr) => `${arr}&${curr[0]}=${curr[1]}`, '');
};
