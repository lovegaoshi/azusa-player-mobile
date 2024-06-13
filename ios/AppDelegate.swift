import UIKit
import CarPlay
import React

@main
class AppDelegate: EXAppDelegateWrapper, RNAppAuthAuthorizationFlowManager {
  
  public weak var authorizationFlowManagerDelegate: RNAppAuthAuthorizationFlowManagerDelegate? // <-- this property is required by the protocol
    //"open url" delegate function for managing deep linking needs to call the resumeExternalUserAgentFlowWithURL method
    override func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return authorizationFlowManagerDelegate?.resumeExternalUserAgentFlow(with: url) ?? false
    }

  var rootView: UIView?
  var concurrentRootEnabled = true

  static var shared: AppDelegate { return UIApplication.shared.delegate as! AppDelegate }

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "azusa-player-mobile"
    let app = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    self.rootView = self.createRootView(
      with: self.bridge!,
      moduleName: self.moduleName!,
      initProps: self.prepareInitialProps()
    )
    return app
  }

  override func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
    if (connectingSceneSession.role == UISceneSession.Role.carTemplateApplication) {
      let scene =  UISceneConfiguration(name: "CarPlay", sessionRole: connectingSceneSession.role)
      scene.delegateClass = CarSceneDelegate.self
      return scene
    } else {
      let scene =  UISceneConfiguration(name: "Phone", sessionRole: connectingSceneSession.role)
      scene.delegateClass = PhoneSceneDelegate.self
      return scene
    }
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    #if DEBUG
      return bundleURL()
    #else
      return Bundle.main.url(forResource:"main", withExtension:"jsbundle")
    #endif
  }
  
  override func bundleURL() -> URL? {
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
  }

  // not exposed from RCTAppDelegate, recreating.
  func prepareInitialProps() -> [String: Any] {
    var initProps = self.initialProps as? [String: Any] ?? [String: Any]()
    #if RCT_NEW_ARCH_ENABLED
      initProps["kRNConcurrentRoot"] = concurrentRootEnabled()
    #endif
    return initProps
  }
}
