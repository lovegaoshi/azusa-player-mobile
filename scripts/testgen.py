'''
import fetcher from '@utils/mediafetch/biliChannel';

test('biliChannel', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/529249/video?tid=129&special_type=&pn=1&keyword=&order=pubdate'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
'''
import os
import glob
for mediafetch in glob.glob('./src/utils/mediafetch/*.ts'):
    mediafetch_name = os.path.splitext(os.path.basename(mediafetch))[0]
    if os.path.exists(f'./__tests__/mediafetch/{mediafetch_name}.test.ts'):
        continue
    with open(f'./__tests__/mediafetch/{mediafetch_name}.test.ts', 'w') as f:
        f.write(f'import fetcher from \'@utils/mediafetch/{mediafetch_name}\';\n')
        f.write('test(\'' + mediafetch_name + '\', async () => {\n')
        f.write('  const content = await fetcher.regexFetch({\n')
        f.write('    reExtracted: fetcher.regexSearchMatch.exec(\n')
        f.write('      \'\'\n')
        f.write('    ),\n')
        f.write('  });\n')
        f.write('  // console.log(content);\n')
        f.write('  expect(content?.songList[0]?.id).not.toBeNull();\n')
        f.write('});\n')
    