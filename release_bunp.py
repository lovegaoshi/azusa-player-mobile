import logging
import re
from enum import Enum
import subprocess
from pathlib import Path
from version_bump import get_version
from fixHTTP import fix_content


class VersionUpdate(Enum):
    MAJOR = 1
    MINOR = 2
    PATCH = 3


def autoincrease_version(version=get_version(), inc=VersionUpdate.PATCH):
    rematch = re.compile(r'(\d+)\.(\d+)\.(\d+)').match(version)
    logging.debug(f'increase version release from {version}')
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
    return f'{major}.{minor}.{patch}'


if __name__ == '__main__':
    import argparse
    logging.basicConfig(level=logging.DEBUG)
    parser = argparse.ArgumentParser(description="ina music segment")
    parser.add_argument("--version", type=str,
                        help="file path or weblink", default=get_version())
    args = parser.parse_args()
    version = get_version()
    new_version = autoincrease_version(
        version=version, inc=VersionUpdate.PATCH)
    fix_content(Path('./src/enums/Version.ts'), lambda line: line.replace(
        version, new_version
    ))
    subprocess.call(['git', 'commit', '-am', f'release: {new_version}'])
    subprocess.call(['git', 'tag', f'v{new_version}'])
    subprocess.call(['git', 'push', 'origin', 'master', '--tags'])
