import getBiliCard from '../../src/utils/Bilibili/biliUserCard';
test('biliCard', async () => {
  const content = await getBiliCard('529249');
  expect(content?.card?.name?.length > 0).toBe(true);
}, 33333);
