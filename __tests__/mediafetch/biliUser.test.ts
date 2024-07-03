import { getBiliUser } from '../../src/utils/mediafetch/biliuser';
test('bilicolle', async () => {
  const content = await getBiliUser('529249');
  console.log(content);
  expect(content).not.toBeNull();
}, 50000);
