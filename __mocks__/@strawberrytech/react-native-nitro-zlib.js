export default function mock() {
  return { inflateAsync: jest.fn(), deflateAsync: jest.fn() };
}
