import {
  create,
  toBinary,
  fromBinary,
  type DescMessage,
} from '@bufbuild/protobuf';
import { type Transport } from '@connectrpc/connect';
import { MetadataSchema } from '../../grpc/bilibili/metadata/metadata_pb';

const Buffer = require('buffer').Buffer;

export const BILI_GRPC_URL = 'https://app.bilibili.com';
export const BILI_GRPC_NATIVE_URL = 'https://grpc.biliapi.net';

export const DEFAULT_GRPC_UA =
  'Dalvik/2.1.0 (Linux; U; Android 12; M2012K11AC Build/SKQ1.211006.001) 7.38.0 os/android model/M2012K11AC mobi_app/android build/7380300 channel/master innerVer/7380300 osVer/12 network/2';

/**
 * Generate base64-encoded metadata binary header (x-bili-metadata-bin)
 */
export const getMetadataBin = (buvid = 'XY1234567890abcdef'): string => {
  const metadata = create(MetadataSchema, {
    mobiApp: 'android',
    build: 7380300,
    channel: 'master',
    buvid,
    platform: 'android',
  });
  return Buffer.from(toBinary(MetadataSchema, metadata)).toString('base64');
};

/**
 * Encodes a protobuf payload with a 5-byte gRPC frame header:
 * [1 byte compression flag (0x00)] + [4 bytes big-endian message length]
 */
export const encodeGrpcFrame = (payload: Uint8Array): Uint8Array => {
  const frame = new Uint8Array(5 + payload.length);
  frame[0] = 0; // uncompressed
  const view = new DataView(frame.buffer);
  view.setUint32(1, payload.length, false);
  frame.set(payload, 5);
  return frame;
};

/**
 * Decodes a 5-byte gRPC frame header and returns the inner protobuf message payload.
 */
export const decodeGrpcFrame = (buf: Uint8Array): Uint8Array => {
  if (buf.length < 5) return buf;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const len = view.getUint32(1, false);
  return buf.subarray(5, 5 + len);
};

/**
 * Low-level helper to send a unary gRPC request to Bilibili and parse the response.
 */
export const sendBiliGrpcRequest = async <
  I extends DescMessage,
  O extends DescMessage,
>(
  schemaInput: I,
  schemaOutput: O,
  path: string,
  input: Parameters<typeof create<I>>[1],
  baseUrl = BILI_GRPC_URL,
): Promise<ReturnType<typeof fromBinary<O>>> => {
  const message = create(schemaInput, input);
  const messageBytes = toBinary(schemaInput, message);
  const framedReq = encodeGrpcFrame(messageBytes);

  const headers = new Headers();
  headers.set('content-type', 'application/grpc');
  headers.set('user-agent', DEFAULT_GRPC_UA);
  headers.set('bili-http-engine', 'cronet');
  headers.set('x-bili-metadata-bin', getMetadataBin());

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: framedReq,
  });

  if (!response.ok) {
    throw new Error(`gRPC request failed with HTTP ${response.status}`);
  }

  const arrayBuf = await response.arrayBuffer();
  const rawBytes = new Uint8Array(arrayBuf);
  const payload = decodeGrpcFrame(rawBytes);

  return fromBinary(schemaOutput, payload) as ReturnType<typeof fromBinary<O>>;
};

/**
 * Creates a Connect-RPC compatible Transport for Bilibili gRPC services.
 */
export const createBiliGrpcTransport = (baseUrl = BILI_GRPC_URL): Transport => {
  return {
    async unary(method, signal, timeoutMs, header, input) {
      const inputMessage = create(method.input, input as any);
      const inputBytes = toBinary(method.input, inputMessage);
      const framedReq = encodeGrpcFrame(inputBytes);

      const url = `${baseUrl}/${method.parent.typeName}/${method.name}`;
      const headers = new Headers(header);
      headers.set('content-type', 'application/grpc');
      headers.set('user-agent', DEFAULT_GRPC_UA);
      headers.set('bili-http-engine', 'cronet');
      headers.set('x-bili-metadata-bin', getMetadataBin());

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: framedReq,
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const resBuf = new Uint8Array(await response.arrayBuffer());
      const rawPayload = decodeGrpcFrame(resBuf);
      const outputMsg = fromBinary(method.output, rawPayload);

      return {
        stream: false,
        service: method.parent,
        method,
        header: response.headers,
        message: outputMsg,
        trailer: new Headers(),
      };
    },
    async stream() {
      throw new Error('Streaming not implemented');
    },
  };
};
