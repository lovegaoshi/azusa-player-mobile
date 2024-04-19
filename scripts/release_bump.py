import logging
import re
from enum import Enum
import subprocess
from pathlib import Path
from version_bump import get_version
from dev_cleartext import fix_content


class VersionUpdate(Enum):
    MAJOR = 1
    MINOR = 2
    PATCH = 3


VersionUpdateDict = {
    1: VersionUpdate.MAJOR,
    2: VersionUpdate.MINOR,
    3: VersionUpdate.PATCH
}


def autoincrease_version(current_version=get_version(), inc=VersionUpdate.PATCH, append=''):
    rematch = re.compile(r'(\d+)\.(\d+)\.(\d+)').match(current_version)
    logging.debug(f'increase version release from {current_version}')
    major = int(rematch.group(1))
    minor = int(rematch.group(2))
    patch = int(rematch.group(3))
    if inc == VersionUpdate.MAJOR:
        major += 1
        minor = 0
        patch = 0
    elif inc == VersionUpdate.MINOR:
        minor += 1
        patch = 0
    elif inc == VersionUpdate.PATCH:
        patch += 1
    return f'{major}.{minor}.{patch}{append}'


if __name__ == '__main__':
    import argparse
    from datetime import datetime
    logging.basicConfig(level=logging.DEBUG)
    parser = argparse.ArgumentParser(description="ina music segment")
    parser.add_argument("--version", type=str,
                        help="file path or weblink", default=get_version())
    parser.add_argument("--inc", type=int,
                        help="file path or weblink", default=3)
    parser.add_argument("--dev",
                        help="add dev", default=False, action='store_true')
    parser.add_argument("--devstr",
                        help="add dev", type=str, default='-dev')
    args = parser.parse_args()
    version = get_version()
    if args.dev:
        fix_content(Path('./src/enums/Version.ts'), lambda line: line.replace(
            version, f'{datetime.now().strftime("%Y.%m.%d")}{args.devstr}'
        ))
    elif args.devstr != '-dev':
        fix_content(Path('./src/enums/Version.ts'), lambda line: line.replace(
            version, f'{version}{args.devstr}'
        ))
    else:
        subprocess.call(['git', 'switch', 'master'])
        new_version = autoincrease_version(
            current_version=version, inc=VersionUpdateDict[args.inc])
        fix_content(Path('./src/enums/Version.ts'), lambda line: line.replace(
            version, new_version
        ))
        subprocess.call(['git', 'commit', '-am', f'release: {new_version}'])
        subprocess.call(['git', 'tag', f'v{new_version}'])
        subprocess.call(['git', 'push', 'origin', 'master', '--tags'])
        subprocess.call(['git', 'switch', 'dev'])
