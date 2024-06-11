import os
import shutil
from dev_cleartext import fix_content

if __name__ == '__main__':
    fix_content('./ios/AppDelegate.swift', lambda line: line.replace(
        '#if true // DEBUG <--- problem?', '#if DEBUG'))

    os.remove('./ios/azusa-player-mobile.entitlements')
    os.remove('./ios/Entitlements.plist')
    shutil.copyfile('./ios/azusa-player-mobile.entitlements.selfsign', './ios/azusa-player-mobile.entitlements')
    shutil.copyfile('./ios/Entitlements.plist.selfsign', './ios/Entitlements.plist')
    # fix_content('./ios/azusa-player-mobile.entitlements', lambda line: line.replace(
    #    '<true/>', '<false/>'))
