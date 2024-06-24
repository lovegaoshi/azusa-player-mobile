import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import * as DocumentPicker from 'expo-document-picker';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
const { NoxAndroidAutoModule } = NativeModules;

export const getFileSize = async (fpath: string) => {
  try {
    return await RNFetchBlob.fs.stat(fpath);
  } catch {
    return { size: 0 };
  }
};

export enum FilePickerResult {
  NoPermission = 'NoPermission',
  UserCancel = 'UserCancel',
  Success = 'Success',
}

interface FilePickerSuccess {
  reason: FilePickerResult.Success;
  uri: string;
  parsedURI: string;
}

interface FilePickerFail {
  reason: FilePickerResult.NoPermission | FilePickerResult.UserCancel;
}

const chooseLocalFileAndroid = async (
  type = 'audio/*'
): Promise<FilePickerSuccess | FilePickerFail> => {
  const androidPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
  );
  if (androidPermission !== PermissionsAndroid.RESULTS.GRANTED) {
    return { reason: FilePickerResult.NoPermission };
  }
  const selectedFile = (
    await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
      type,
    })
  ).assets;
  if (!selectedFile) return { reason: FilePickerResult.UserCancel };
  const uri = selectedFile[0].uri;
  return {
    reason: FilePickerResult.Success,
    uri,
    parsedURI: decodeURIComponent(uri.substring(uri.lastIndexOf('%3A') + 3)),
  };
};

export const chooseLocalMediaFolderAndroid = async () => {
  const location = await chooseLocalFileAndroid();
  if (location.reason !== FilePickerResult.Success) return location;
  if (Number.isNaN(Number.parseInt(location.parsedURI))) {
    return {
      reason: FilePickerResult.Success,
      relativePath: location.parsedURI.substring(
        0,
        location.parsedURI.lastIndexOf('/')
      ),
    };
  }
  const mediaFiles = await NoxAndroidAutoModule.listMediaFileByID(
    location.uri.substring(location.uri.lastIndexOf('%3A') + 3)
  );
  return {
    reason: FilePickerResult.Success,
    relativePath: mediaFiles[0].relativePath,
  };
};
