import getBiliNotice from '../../src/utils/Bilibili/biliNotice';
test('biliNotice', async () => {
  const content = await getBiliNotice('529249');
  expect(content.length > 0).toBe(true);
}, 33333);
