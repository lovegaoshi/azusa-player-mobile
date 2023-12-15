import { biliNFTVideoFetch } from '@utils/mediafetch/biliNFT';

test('biliNFT', async () => {
  const content = await biliNFTVideoFetch({
    act_id: '161',
    index: '晚宴一角·雪绘',
  });
  // console.log(content);
  expect(content).not.toBeNull();
  const content2 = await biliNFTVideoFetch({
    act_id: '161',
    index: 1,
  });
  // console.log(content);
  expect(content2).not.toBeNull();
});
