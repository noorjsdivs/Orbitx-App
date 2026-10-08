/**
 * Adopts the UIKit scene-based life cycle, which apps built with the iOS 27 SDK must use
 * (otherwise UIKit asserts at launch: "UIScene life cycle is required for apps built with this SDK").
 *
 * Backports the Expo SDK 58 bare template on top of SDK 57, which already ships
 * `ExpoAppSceneDelegate` + `ExpoReactNativeFactoryProvider`:
 *  - AppDelegate conforms to ExpoReactNativeFactoryProvider and no longer creates the window
 *  - SceneDelegate (subclass of ExpoAppSceneDelegate) creates the window and starts React Native
 *  - Info.plist declares the scene manifest
 *
 * Remove this plugin after upgrading to an SDK whose template does this by default.
 */
const fs = require('fs');
const path = require('path');
const { withAppDelegate, withDangerousMod, withInfoPlist, withXcodeProject, IOSConfig } = require('expo/config-plugins');

const SCENE_DELEGATE = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') return cfg;
    let src = cfg.modResults.contents;
    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      src = src.replace('class AppDelegate: ExpoAppDelegate {', 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
    }
    src = src.replace(
      /\n#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif\n/,
      '\n    // The window is created and React Native is started by `SceneDelegate` under the\n    // scene-based life cycle (required by the iOS 27 SDK).\n',
    );
    cfg.modResults.contents = src;
    return cfg;
  });
}

function withSceneDelegateFile(config) {
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
      const file = path.join(cfg.modRequest.platformProjectRoot, projectName, 'SceneDelegate.swift');
      fs.writeFileSync(file, SCENE_DELEGATE);
      return cfg;
    },
  ]);
  return withXcodeProject(config, (cfg) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(cfg.modRequest.projectRoot);
    const filepath = `${projectName}/SceneDelegate.swift`;
    if (!cfg.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath, groupName: projectName, project: cfg.modResults });
    }
    return cfg;
  });
}

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneManifest(withSceneDelegateFile(withSceneAppDelegate(config)));
};
