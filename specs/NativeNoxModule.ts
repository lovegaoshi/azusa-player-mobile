import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

interface NoxMedia {
  URI: string;
  relativePath: string;
  fileName: string;
  realPath: string;
  title: string;
  album: string;
  artist: string;
  duration: number;
  bitrate: number;
}

interface POToken {
  visitorData: string;
  playerRequestPoToken: string;
  streamingDataPoToken: string;
}

export interface Spec extends TurboModule {
  getUri: (uri: string) => Promise<string>;
  listMediaDir: (relativeDir: string, subdir: boolean) => Promise<NoxMedia[]>;
  listMediaFileByFName: (
    filename: string,
    relativeDir: string,
  ) => Promise<NoxMedia[]>;
  listMediaFileByID: (id: string) => Promise<NoxMedia[]>;
  loadRN: () => void;
  setresumeOnPause: (resumeOnPause: boolean) => void;
  isRNLoaded: () => boolean;
  getLastExitCode: () => number;
  getLastExitReason: () => boolean;
  isGestureNavigationMode: () => boolean;
  selfDestruct: () => void;
  setDarkTheme: (mode: number) => void;
  getRAMUsage: () => number;
  calcBeatsFromFile: (filePath: string) => Promise<number[]>;

  getPOToken: (vidioId: string) => POToken;
  getPOTokenVisitor: (visitorData: string) => POToken;
}

export default TurboModuleRegistry.get<Spec>('NativeNoxModule');
