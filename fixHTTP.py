from pathlib import Path
import os


def fix_content(path: str, transform) -> None:
    content = []
    with open(Path(path), encoding='utf8') as f:
        for i in f:
            content.append(transform(i))

    with open(Path(path), 'w', encoding='utf8') as f:
        for line in content:
            f.write(line)


if __name__ == '__main__':
    mfplugin_dir = './MusicFreePlugins/dist'
    for i in os.listdir(mfplugin_dir):
        index_js_path = os.path.join(mfplugin_dir, i, 'index.js')
        if os.path.isfile(index_js_path):
            fix_content(index_js_path, lambda line: line.replace(
                'http://', 'https://'))
