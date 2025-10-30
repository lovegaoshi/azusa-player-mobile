//
//  ShareViewController.swift
//  APMShare
//
//  Created by Rachel on 10/29/25.
//

import UIKit

class ShareViewController: UIViewController {

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    handleShared()
  }
  
  private func handleShared() {
    guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
          let itemProvider = extensionItem.attachments?.first
    else {
      self.completeRequest()
      return
    }
    
    if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
      itemProvider.loadItem(forTypeIdentifier: "public.url", options: nil) { (urlItem, _) in
        if let shareURL = urlItem as? URL {
          let encodedURL = shareURL.absoluteString
            .addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
          let schemeStr = "noxplayer://\(encodedURL)"
          
          if let schemeURL = URL(string: schemeStr) {
            self.openURL(schemeURL)
            self.completeRequest()
          } else {
            self.completeRequest()
          }
        } else {
          self.completeRequest()
        }
      }
    } else {
      self.completeRequest()
    }
  }
  
  private func completeRequest() {
    self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
  }
  
  @objc func openURL(_ url: URL) -> Bool {
    var responder: UIResponder? = self
    while responder != nil {
      if let application = responder as? UIApplication {
        application.open(url)
        return true
      }
      responder = responder?.next
    }
    return false
  }
}
