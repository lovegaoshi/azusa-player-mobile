import java.io.File

// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    project.extra.apply {
        set("minSdkVersion", 26)
        set("compileSdkVersion", 37)
        set("targetSdkVersion", 37)

        // We use NDK 23 which has both M1 support and is the side-by-side NDK version from AGP.
        set("ndkVersion", "27.1.12297006")

        set("ffmpegKitPackage", "audio")
        set("kotlinVersion", "2.3.20")
    }
    repositories {
        mavenLocal()
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath(libs.react.native.gradle.plugin)
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${project.extra["kotlinVersion"]}")
    }
}

val reactNativeAndroidDir = File(
    providers.exec {
        workingDir(rootDir)
        commandLine("node", "--print", "require.resolve('react-native/package.json')")
    }.standardOutput.asText.get().trim(),
    "../android",
)

allprojects {
    repositories {
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url = uri(reactNativeAndroidDir)
        }

        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
        maven {
            name = "TarsosDSP repository"
            url = uri("https://mvn.0110.be/releases")
        }
    }
}

apply(plugin = "com.facebook.react.rootproject")
apply(plugin = "expo-root-project")
