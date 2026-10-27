import java.io.File

pluginManagement {
    val reactNativeGradlePlugin = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })",
            )
        }.standardOutput.asText.get().trim(),
    ).parentFile.absolutePath
    includeBuild(reactNativeGradlePlugin)

    val expoPluginsPath = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })",
            )
        }.standardOutput.asText.get().trim(),
        "../android/expo-gradle-plugin",
    ).absolutePath
    includeBuild(expoPluginsPath)
}

plugins {
    id("com.facebook.react.settings")
    id("expo-autolinking-settings")
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

extensions.configure<com.facebook.react.ReactSettingsExtension> {
    if (System.getenv("EXPO_USE_COMMUNITY_AUTOLINKING") == "1") {
        autolinkLibrariesFromCommand()
    } else {
        autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand)
    }
}

dependencyResolutionManagement {
    versionCatalogs {
        create("apmLibs") {
            from(files("gradle/libs.versions.toml"))
        }
    }
}

rootProject.name = "azusa-player-mobile"
include(":ffmpeg-kit-binaries")
include(":app")

expoAutolinking.useExpoModules()
expoAutolinking.useExpoVersionCatalog()
includeBuild(expoAutolinking.reactNativeGradlePlugin)
