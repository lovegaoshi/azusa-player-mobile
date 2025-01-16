export interface SelectSettingEntry<T> {
  options: T[];
  renderOption: (option: T) => string;
  defaultIndex: number;
  onClose: (index?: number) => void;
  onSubmit: (index: number) => void;
  title: string;
}

export interface CheckSettingEntry<T> {
  options: T[];
  renderOption: (option: T) => string;
  onClose: (index?: boolean[]) => void;
  onSubmit: (index: boolean[]) => void;
  title: string;
}

export interface SettingEntry {
  settingName: string;
  settingCategory: string;
  reRender?: boolean;
  settingType?: string;
  checkbox?: boolean;
  callback?: () => void;
}
