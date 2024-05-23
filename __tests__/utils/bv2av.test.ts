import bfetch from "../../src/utils/BiliFetch";
import { bv2av } from "../../src/utils/bv2av";
const API =
  "https://api.bilibili.com/x/centralization/interface/music/comprehensive/web/rank?pn=1&ps=100";

test("bv2av", async () => {
  const req = await bfetch(API);
  const json = await req.json();
  json.data.list.forEach((v: any) => {
    expect(bv2av(v.bvid)).toBe(Number(v.aid));
  });
}, 10000);
