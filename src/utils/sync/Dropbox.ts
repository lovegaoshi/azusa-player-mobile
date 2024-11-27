import { Dropbox as _Dropbox, files } from 'dropbox';

import { logger } from '@utils/Logger';

const DEFAULT_FILE_NAME = 'nox.noxBackup';
const DEFAULT_FILE_PATH = `/${DEFAULT_FILE_NAME}`;

const find = async (dbx: _Dropbox, query = DEFAULT_FILE_NAME) => {
  const data = await dbx.filesSearchV2({
    query,
    options: {
      order_by: { '.tag': 'last_modified_time' },
    },
  });
  try {
    const fileMetadata = data.result.matches[0]
      .metadata as files.MetadataV2Metadata;
    return fileMetadata.metadata.path_display;
  } catch (e) {
    logger.warn(`no ${query} found: ${e}`);
    return null;
  }
};

export const noxBackup = (
  dbx: _Dropbox,
  content: Uint8Array,
  fpath = DEFAULT_FILE_PATH,
) =>
  dbx.filesUpload({
    path: fpath,
    mode: { '.tag': 'overwrite' },
    contents: content,
  });

const download = async (
  dbx: _Dropbox,
  contentParse: (v: Blob) => Promise<Uint8Array>,
  fpath = DEFAULT_FILE_PATH,
) => {
  if (fpath === null) {
    return null;
  }
  const downloadedFile = await dbx.filesDownload({ path: fpath });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error: dropbox didnt have fileBlob in their sdk anywhere but UPGRADING.md
  const blob = await contentParse(downloadedFile.result.fileBlob);
  return new Uint8Array(blob);
};

/**
 * wraps up find noxplayer setting and download in one function;
 * returns the JSON object of settting or null if not found.
 * @returns playerSetting object, or null
 */
export const noxRestore = async (
  dbx: _Dropbox,
  contentParse: (v: Blob) => Promise<Uint8Array>,
) => {
  const noxFile = await find(dbx);
  if (!noxFile) {
    throw new Error('noxfile is not found on dropbox.');
  }
  return download(dbx, contentParse, noxFile);
};

export const checkAuthentication = async (dbx: _Dropbox) => {
  try {
    await dbx.usersGetCurrentAccount();
    return true;
  } catch (e) {
    logger.warn(`[sync] auth failed:${e}`);
    return false;
  }
};
