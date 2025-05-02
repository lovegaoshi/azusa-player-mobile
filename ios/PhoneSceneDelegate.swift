import Foundation
import UIKit
import SwiftUI

class PhoneSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?
  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {

    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    appDelegate.initRN(launchOptions: connectionOptions2LaunchOptions(connectionOptions: connectionOptions))
    
    guard let windowScene = scene as? UIWindowScene else { return }
    guard let appRootView = appDelegate.window?.rootViewController?.view else { return }
    
    let rootViewController = UIViewController()
    rootViewController.view.addSubview(appRootView)

    let window = UIWindow(windowScene: windowScene)
    window.rootViewController = rootViewController
    self.window = window
    window.makeKeyAndVisible()
  }
}

func connectionOptions2LaunchOptions(connectionOptions: UIScene.ConnectionOptions?) -> [UIApplication.LaunchOptionsKey: Any] {
  var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]
  
  if let options = connectionOptions {
    if options.notificationResponse != nil {
      launchOptions[UIApplication.LaunchOptionsKey.remoteNotification] = options.notificationResponse?.notification.request.content.userInfo;
    }
    
    if !options.userActivities.isEmpty {
      let userActivity = options.userActivities.first;
      let userActivityDictionary = [
        "UIApplicationLaunchOptionsUserActivityTypeKey": userActivity?.activityType as Any,
        "UIApplicationLaunchOptionsUserActivityKey": userActivity!
      ] as [String : Any];
      launchOptions[UIApplication.LaunchOptionsKey.userActivityDictionary] = userActivityDictionary;
    }
  }
  
  return launchOptions
}
