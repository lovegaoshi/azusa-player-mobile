import Foundation
import CarPlay

class CarSceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
  func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                  didConnect interfaceController: CPInterfaceController) {
    guard let appDelegate = (UIApplication.shared.delegate as? AppDelegate) else { return }
    appDelegate.initAppFromScene(connectionOptions: nil)
    RNCarPlay.connect(with: interfaceController, window: templateApplicationScene.carWindow)
  }

  func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didDisconnectInterfaceController interfaceController: CPInterfaceController) {
    RNCarPlay.disconnect()
  }
}
