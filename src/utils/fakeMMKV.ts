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
