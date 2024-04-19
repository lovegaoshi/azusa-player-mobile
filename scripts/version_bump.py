import re
import json
from pathlib import Path


def get_version():
    with open(Path('src/enums/Version.ts'), encoding='utf8') as f:
        for line in f:
            find_version = re.search(r'(\d+\.\d+\.\d+)', line)
            if (find_version):
                return find_version.group(0)


def bump_version():
    new_version = get_version()
    with open(Path('./package.json'), encoding='utf8') as f:
        package_json = json.load(f)
    package_json['version'] = new_version
    with open(Path('./package.json'), 'w', encoding='utf8') as f:
        json.dump(package_json, f, indent=2)
    build_gradle = []
    with open(Path('./android/app/build.gradle'), encoding='utf8') as f:
        for line in f:
            find_version_code = re.search(r'(.+versionCode )(\d+)', line)
            find_version_name = re.search(r'(.+versionName )".+"', line)
            if not '//' in line and find_version_code:
                build_gradle.append(
                    f"{find_version_code.group(1)}{int(find_version_code.group(2)) + 1}\n")
            elif find_version_name:
                build_gradle.append(
                    f"{find_version_name.group(1)}\"{new_version}\"\n")
            else:
                build_gradle.append(line)
    with open(Path('./android/app/build.gradle'), 'w', encoding='utf8') as f:
        for line in build_gradle:
            f.write(line)

    build_gradle = []
    with open(Path('./ios/APM.xcodeproj/project.pbxproj'), encoding='utf8') as f:
        for line in f:
            find_version_code = re.search(
                r'(.+CURRENT_PROJECT_VERSION = )(\d+);', line)
            find_version_name = re.search(
                r'(.+MARKETING_VERSION = ).+;', line)
            if not '//' in line and find_version_code:
                build_gradle.append(
                    f"{find_version_code.group(1)}{int(find_version_code.group(2)) + 1};\n")
            elif find_version_name:
                build_gradle.append(
                    f"{find_version_name.group(1)}{new_version};\n")
            else:
                build_gradle.append(line)
    with open(Path('./ios/APM.xcodeproj/project.pbxproj'), 'w', encoding='utf8') as f:
        for line in build_gradle:
            f.write(line)


if __name__ == '__main__':
    bump_version()
    print(f"Version bumped to {get_version()}")
