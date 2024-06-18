import os
import shutil

if __name__ == '__main__':

    os.remove('./ios/azusa-player-mobile.entitlements')
    os.remove('./ios/Entitlements.plist')
    shutil.copyfile('./ios/azusa-player-mobile.entitlements.selfsign', './ios/azusa-player-mobile.entitlements')
    shutil.copyfile('./ios/Entitlements.plist.selfsign', './ios/Entitlements.plist')
