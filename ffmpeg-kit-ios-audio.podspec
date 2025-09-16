#
# Be sure to run `pod lib lint ffmpeg-kit-ios-audio.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'ffmpeg-kit-ios-audio'
  s.version          = '6.0'
  s.summary          = 'A short description of ffmpeg-kit-ios-audio.'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
TODO: Add long description of the pod here.
                       DESC

  # s.screenshots     = 'www.example.com/screenshots_1', 'www.example.com/screenshots_2'
  s.author           = { 'lovegaoshi' => 'love@gao.shi' }
  s.homepage         = 'https://google.com'
  s.source           = { :http => 'https://github.com/lovegaoshi/ffmpeg-kit/releases/download/v6.0.2-binary/ffmpeg-kit-audio-6.0-ios-xcframework.zip' }
  # s.social_media_url = 'https://twitter.com/<TWITTER_USERNAME>'
  
  s.ios.deployment_target = '15.1'
  s.ios.frameworks = 'AudioToolbox', 'AVFoundation', 'CoreMedia', 'VideoToolbox'
  s.ios.vendored_frameworks = 'ffmpegkit.xcframework', 'libavcodec.xcframework', 'libavdevice.xcframework', 'libavfilter.xcframework', 'libavformat.xcframework', 'libavutil.xcframework', 'libswresample.xcframework', 'libswscale.xcframework'  
  # s.resource_bundles = {
  #   'ffmpeg-kit-ios-audio' => ['ffmpeg-kit-ios-audio/Assets/*.png']
  # }

  # s.public_header_files = 'Pod/Classes/**/*.h'
  # s.frameworks = 'UIKit', 'MapKit'
  # s.dependency 'AFNetworking', '~> 2.3'
end
