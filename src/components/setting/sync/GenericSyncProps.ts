/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ImportProps {
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
  noxRestore: () => Promise<any>;
  login: (
    callback: () => any,
    errorHandling: (e: Error) => void,
  ) => Promise<boolean>;
}

export interface ExportProps {
  noxBackup: (content: Uint8Array) => Promise<any>;
  login: (
    callback: () => any,
    errorHandling: (e: Error) => void,
  ) => Promise<boolean>;
}

export interface Props {
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
  noxRestore: () => Promise<any>;
  noxBackup: (content: Uint8Array) => Promise<any>;
  login: (
    callback: () => any,
    errorHandling: (e: Error) => void,
  ) => Promise<boolean>;
}

export interface GenericProps {
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
}
