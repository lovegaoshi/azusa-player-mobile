import biliSuggest from '../../src/utils/Bilibili/BiliKwSuggest';

test('bilisuggest', async () => {
  expect((await biliSuggest('wake')).length).not.toBe(0);
}, 10000);
