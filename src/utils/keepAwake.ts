import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

export default async (func: () => Promise<unknown>) => {
  activateKeepAwakeAsync();
  await func();
  deactivateKeepAwake();
};
