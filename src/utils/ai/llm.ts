import { adk } from '@react-native-ai/adk';
import { generateText } from 'ai';
import { timeFunction } from '../Utils';

export const init = async () => {
  if (!(await adk.isAvailable())) {
    throw new Error('Gemini Nano is not available on this device');
  }
  await adk.prepareNano();
};

interface PromptProps {
  prompt: string;
}
export const prompt = async ({ prompt }: PromptProps) => {
  const { text } = await generateText({
    model: adk(),
    prompt,
  });
  return text;
};

export default async () => {
  await timeFunction(init, 'gemini nano init');
  console.log(
    await prompt({
      prompt:
        'extract the song name in the following string. if not found, return the original string. 玉芬世界巡演，但是琵琶曲【渲染大赛合订本】',
    }),
  );
};
