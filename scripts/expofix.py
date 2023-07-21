from pathlib import Path


def fix_file(filepath, linefunc):
    content = []
    with open(filepath, encoding='utf8') as f:
        for line in f:
            content.append(linefunc(line))
    with open(filepath, 'w', encoding='utf8') as f:
        for line in content:
            f.write(line)


if __name__ == '__main__':
    import sys
    sys.exit(0)
    fix_file(Path('node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios/RCTTurboModule.mm'),
             lambda x: x.replace('#import <ReactCommon/LongLivedObject.h>', '#import <react/bridging/LongLivedObject.h>'))
    fix_file(Path('ios/Pods/Headers/Public/ReactCommon/ReactCommon/TurboModuleBinding.h'),
             lambda x: x.replace('#include <ReactCommon/LongLivedObject.h>', '#include <react/bridging/LongLivedObject.h>'))
    fix_file(Path('ios/Pods/Headers/Private/ReactCommon/ReactCommon/TurboModuleBinding.h'),
             lambda x: x.replace('#include <ReactCommon/LongLivedObject.h>', '#include <react/bridging/LongLivedObject.h>'))
    fix_file(Path('node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp'),
             lambda x: x.replace('#include <ReactCommon/LongLivedObject.h>', '#include <react/bridging/LongLivedObject.h>'))
    # fix_file(Path('node_modules/react-native/ReactAndroid/src/main/jni/react/turbomodule/ReactCommon/TurboModuleManager.h'), lambda x: x.replace('#include <ReactCommon/LongLivedObject.h>', '#include <react/bridging/LongLivedObject.h>'))
