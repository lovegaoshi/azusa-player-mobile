import { adk, createAdkProvider } from '@react-native-ai/adk';
import { generateText } from 'ai';

// eslint-disable-next-line import/no-unresolved
import { GOOGLE_API_KEY } from '@env';
import {
  getSecure as getItem,
  saveSecure as saveItem,
} from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';
import { timeFunction } from '../Utils';

let myadk = adk;

export const init = async (
  local = true,
  cloudKey = () => getItem(StorageKeys.GEMINI_API_KEY, GOOGLE_API_KEY),
) => {
  if (!local || !(await adk.isAvailable())) {
    console.warn('[AI] not using local gemini; opting for cloud instead');
    myadk = createAdkProvider({
      apiKey: await cloudKey(),
      modelType: 'gemini',
      modelName: 'gemini-3.8-flash',
    });
    return;
  }
  await adk.prepareNano();
};

export const setAPIKey = async (key: string) => {
  init(key.length === 0, async () => key);
  if ((await prompt({ prompt: 'return empty str' })).length < 0) {
    throw new Error('[AI] could NOT get a valid response');
  }
  saveItem(StorageKeys.GEMINI_API_KEY, key);
};

interface PromptProps {
  prompt: string;
}
export const prompt = async ({ prompt }: PromptProps) => {
  const { text } = await generateText({
    model: myadk(),
    prompt,
  });
  return text;
};

export default async () => {
  await timeFunction(init, 'gemini nano init');
  console.log(
    'gemini',
    await prompt({
      prompt:
        'extract the song name in the following string. if not found, return an empty string. 【4K古风翻唱】人间琴悠扬，姑娘把谁记心上～｜《琵琶曲》安安静静，带你沉溺四分钟的烟雨江南',
    }),
  );
};
