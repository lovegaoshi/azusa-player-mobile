import { fetchBiliView } from '../../src/utils/mediafetch/biliGRPC';

const BVID = 'BV1BDk2YCEHF';

describe('bilibili view_pb protobuf tests', () => {
  test('fetches view using fetchBiliView utility', async () => {
    const reply = await fetchBiliView(BVID);
    expect(reply.bvid).toBe(BVID);
    expect(reply.pages.length > 1).toBe(true);
  }, 30000);
});
