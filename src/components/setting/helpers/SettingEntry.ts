interface BaseSettingEntry<T> {
  options: T[];
  renderOption: (option: T, index: number) => string;
  title: string;
}

export interface SelectSettingEntry<T> extends BaseSettingEntry<T> {
  defaultIndex: number;
  onClose: (index?: number) => void;
  onSubmit: (index: number) => void;
}

export interface CheckSettingEntry<T> extends BaseSettingEntry<T> {
  onClose: (index?: boolean[]) => void;
  onSubmit: (index: boolean[]) => void;
}

export interface SettingEntry {
  settingName: string;
  settingCategory: string;
  reRender?: boolean;
  settingType?: string;
  checkbox?: boolean;
  callback?: () => void;
}
