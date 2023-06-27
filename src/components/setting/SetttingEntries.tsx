export interface EnterSettingEntry {

}


export interface SelectSettingEntry<T> {
    options: Array<T>;
    renderOption: (option: T) => string;
    defaultIndex: number;
    onClose: (index?: number) => void;
    onSubmit: (index: number) => void;
}

export interface SettingEntry {
    settingName: string;
    settingCategory: string;
    reRender?: boolean;
    settingType?: string;
    checkbox?: boolean;
}

export const dummySelectSettingEntry: SelectSettingEntry<string> = {
    options: [],
    renderOption: () => '',
    defaultIndex: 0,
    onClose: () => undefined,
    onSubmit: () => undefined,
};