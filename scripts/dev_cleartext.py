from pathlib import Path


def fix_content(path: str, transform) -> None:
    content = []
    with open(Path(path), encoding='utf8') as f:
        for i in f:
            content.append(transform(i))

    with open(Path(path), 'w', encoding='utf8') as f:
        for line in content:
            f.write(line)


if __name__ == '__main__':
    fix_content('android/app/src/main/AndroidManifest.xml', lambda line: line.replace(
        'android:usesCleartextTraffic="false"', 'android:usesCleartextTraffic="true"'))
