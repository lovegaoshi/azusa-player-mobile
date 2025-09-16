import os
import sys

from dev_cleartext import fix_content

if __name__ == '__main__':

    fix_content('./node_modules/youtubei.js/package.json', lambda line: line.replace(
        '"react-native": "./dist/src/platform/react-native.js",', '"react-native": "./bundle/react-native.js",'
    ))

    sys.exit(0)
    mfplugin_dir = './MusicFreePlugins/dist'
    for i in os.listdir(mfplugin_dir):
        index_js_path = os.path.join(mfplugin_dir, i, 'index.js')
        if os.path.isfile(index_js_path):
            fix_content(index_js_path, lambda line: line.replace(
                'http://', 'https://'))
