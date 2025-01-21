from dev_cleartext import fix_content

if __name__ == '__main__':
  fix_content(
    'android/gradle.properties',
    lambda l: l.replace('newArchEnabled=false', 'newArchEnabled=true'))
  fix_content(
    'android/app/src/main/AndroidManifest.xml',
    lambda l: l.replace(
      'android:authorities="com.noxplay.noxplayer.provider"',
      'android:authorities="com.noxplay.noxplayer.new.provider"'))
  fix_content(
    'android/app/build.gradle',
    lambda l: l.replace(
      'applicationId "com.noxplay.noxplayer"',
      'applicationId "com.noxplay.noxplayer.new"'))
  fix_content(
    'android/app/src/main/res/values/strings.xml',
    lambda l: l.replace(
      '<string name="app_name">APM</string>',
      '<string name="app_name">APM.new</string>'))
  fix_content(
    'android/app/src/main/res/values-zh/strings.xml',
    lambda l: l.replace(
      '<string name="app_name">APM</string>',
      '<string name="app_name">APM.new</string>'))