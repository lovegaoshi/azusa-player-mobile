class MMKV {
  id: string;
  map: Map<string, Uint8Array>;

  constructor({ id }: { id: string }) {
    this.id = id;
    this.map = new Map();
  }
  getBuffer(key: string) {
    const value = this.map.get(key);
    return value ? { buffer: value } : null;
  }
  set(key: string, value: Uint8Array) {
    this.map.set(key, value);
  }
  delete(key: string) {
    this.map.delete(key);
  }
}

export default MMKV;

export class GHCacher {
  cache_dir = '';

  async get(player_id: string) {
    console.log(`[fakemmkv] ytbi is attempting to load from gh: ${player_id}`);
    const req = await fetch(
      `https://raw.githubusercontent.com/lovegaoshi/my-express-api/refs/heads/ghactions/cachedPlayers/${player_id}`,
    );
    if (req.ok) return req.arrayBuffer();
    // resort to the latest cached by github instead.
    const latestGHCacheReq = await fetch(
      'https://raw.githubusercontent.com/lovegaoshi/my-express-api/refs/heads/ghactions/cachedPlayers/latest',
    );
    const ghCache = await latestGHCacheReq.text();
    console.log(
      `[fakeMMKV] attempts to load from gh latest instead: ${ghCache}`,
    );
    const reqGH = await fetch(
      `https://raw.githubusercontent.com/lovegaoshi/my-express-api/refs/heads/ghactions/cachedPlayers/${ghCache}`,
    );
    if (reqGH.ok) return reqGH.arrayBuffer();
    console.log(`[fakeMMKV] attempts to load from netlify: ${player_id}`);
    // old implementation that uses netlify to resolve on the fly. ~5s delay
    const req2 = await fetch(
      `https://ytb-cache.netlify.app/api?playerURL=${player_id}`,
    );
    if (req2.ok) return req2.arrayBuffer();
    return undefined;
  }

  async set() {}

  async remove() {}
}
