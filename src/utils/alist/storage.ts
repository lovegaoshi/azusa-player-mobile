import {
  getSecure as getItem,
  saveSecure as saveItem,
} from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';

export const getAlistCred = (): Promise<NoxStorage.AListCred[]> =>
  getItem(StorageKeys.ALIST_CRED, []);

export const setAlistCred = (cred: NoxStorage.AListCred[]) =>
  saveItem(StorageKeys.ALIST_CRED, cred);

export const removeAlistCred = async (cred: NoxStorage.AListCred) => {
  const aListCreds = await getAlistCred();
  setAlistCred(aListCreds.filter(acred => acred[0] !== cred[0]));
};

export const removeAlistCredAt = async (i: number) => {
  const aListCreds = await getAlistCred();
  aListCreds.splice(i, 1);
  setAlistCred(aListCreds);
};

export const addAlistCred = async (cred: NoxStorage.AListCred) => {
  const aListCreds = await getAlistCred();
  aListCreds.push(cred);
  setAlistCred(aListCreds);
};
