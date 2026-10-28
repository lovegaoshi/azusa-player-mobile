import com.android.build.api.dsl.Packaging
import java.io.File

plugins {
    id("com.android.application")
    id("com.facebook.react")
    id("kotlin-android")
}

val projectRoot = rootDir.absoluteFile.parentFile.absolutePath

/**
 * This is the configuration block to customize your React Native Android app.
 * By default you don't need to apply any configuration, just uncomment the lines you need.
 */
react {
    entryFile = file(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "-e",
                "require('expo/scripts/resolveAppEntry')",
                projectRoot,
                "android",
                "absolute",
            )
        }.standardOutput.asText.get().trim(),
    )
    reactNativeDir = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('react-native/package.json')",
            )
        }.standardOutput.asText.get().trim(),
    ).parentFile.absoluteFile
    hermesCommand = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('hermes-compiler/package.json', { paths: [require.resolve('react-native/package.json')] })",
            )
        }.standardOutput.asText.get().trim(),
    ).parentFile.absolutePath + "/hermesc/%OS-BIN%/hermesc"
    codegenDir = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })",
            )
        }.standardOutput.asText.get().trim(),
    ).parentFile.absoluteFile

    /* Folders */

    //   The root of your project, i.e. where "package.json" lives. Default is '../..'
    // root = file("../../")
    //   The folder where the react-native NPM package is. Default is ../../node_modules/react-native
    // reactNativeDir = file("../../node_modules/react-native")
    //   The folder where the react-native Codegen package is. Default is ../../node_modules/@react-native/codegen
    // codegenDir = file("../../node_modules/@react-native/codegen")
    //   The cli.js file which is the React Native CLI entrypoint. Default is ../../node_modules/react-native/cli.js
    // cliFile = file("../../node_modules/react-native/cli.js")

    /* Variants */
    //   The list of variants to that are debuggable. For those we're going to
    //   skip the bundling of the JS bundle and the assets. By default is just 'debug'.
    //   If you add flavors like lite, prod, etc. you'll have to list your debuggableVariants.
    // debuggableVariants = ["liteDebug", "prodDebug"]

    /* Bundling */
    //   A list containing the node command and its flags. Default is just 'node'.
    // nodeExecutableAndArgs = ["node"]

    //   The command to run when bundling. By default is 'bundle'
    // bundleCommand = "ram-bundle"

    //   The path to the CLI configuration file. Default is empty.
    // bundleConfig = file(../rn-cli.config.js)

    //   The name of the generated asset file containing your JS bundle
    bundleAssetName = "index.android.bundle"

    //   The entry file for bundle generation. Default is 'index.android.js' or 'index.js'
    // entryFile = file("../js/MyApplication.android.js")

    //   A list of extra flags to pass to the 'bundle' commands.
    //   See https://github.com/react-native-community/cli/blob/main/docs/commands.md#bundle
    // extraPackagerArgs = []

    /* Hermes Commands */
    //   The hermes compiler command to run. By default it is 'hermesc'
    // hermesCommand = "$rootDir/my-custom-hermesc/bin/hermesc"

    //   The list of flags to pass to the Hermes compiler. By default is ["-O", "-output-source-map"]
    // hermesFlags = ["-O", "-output-source-map"]

    /* Autolinking */
    autolinkLibrariesWithApp()
}

val appVersionCode = 616

val enableSeparateBuildPerCPUArchitecture = true

/**
 * Set this to true to Run Proguard on Release builds to minify the Java bytecode.
 */
val enableProguardInReleaseBuilds = true

/**
 * The preferred build flavor of JavaScriptCore (JSC).
 *
 * For example, to use the international variant, you can use:
 * `io.github.react-native-community:jsc-android-intl:2026004.+`
 *
 * The international variant includes ICU i18n library and necessary data
 * allowing to use e.g. `Date.toLocaleString` and `String.localeCompare` that
 * give correct results when using with locales other than en-US. Note that
 * this variant is about 6MiB larger per architecture than default.
 */
val jscFlavor = "io.github.react-native-community:jsc-android:2026004.+"

fun reactNativeArchitectures(): List<String> {
    val value = project.findProperty("reactNativeArchitectures") as String?
    return value?.split(",")
        ?: listOf("armeabi-v7a", "x86", "x86_64", "arm64-v8a")
}

val hermesEnabled =
    (project.findProperty("hermesEnabled") as String?)?.toBoolean() ?: false

apply(
    from = File(
        providers.exec {
            workingDir(rootDir)
            commandLine(
                "node",
                "--print",
                "require.resolve('@sentry/react-native/package.json')",
            )
        }.standardOutput.asText.get().trim(),
        "../sentry.gradle",
    ),
)

extensions.configure(
    com.android.build.gradle.internal.dsl.BaseAppModuleExtension::class.java,
) {
    ndkVersion = rootProject.extra["ndkVersion"] as String

    namespace = "com.noxplay.noxplayer"
    compileSdk = rootProject.extra["compileSdkVersion"] as Int
    packaging {
        resources.excludes.add("META-INF/INDEX.LIST")
        resources.excludes.add("META-INF/DEPENDENCIES")
    }
    defaultConfig {
        applicationId = "com.noxplay.noxplayer"
        minSdk = rootProject.extra["minSdkVersion"] as Int
        targetSdk = rootProject.extra["targetSdkVersion"] as Int
        versionCode = appVersionCode
        versionName = "4.3.3"
        manifestPlaceholders["appAuthRedirectScheme"] = "com.noxplayer"
        vectorDrawables.useSupportLibrary = true
    }
    splits {
        abi {
            reset()
            isEnable = enableSeparateBuildPerCPUArchitecture
            isUniversalApk = false // If true, also generate a universal APK
            //noinspection ChromeOsAbiSupport
            include(*reactNativeArchitectures().toTypedArray())
        }
    }
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        create("release") {
            if (project.hasProperty("MYAPP_UPLOAD_STORE_PASSWORD")) {
                storeFile = file(project.property("MYAPP_UPLOAD_STORE_FILE") as String)
                storePassword = project.property("MYAPP_UPLOAD_STORE_PASSWORD") as String
                keyAlias = project.property("MYAPP_UPLOAD_KEY_ALIAS") as String
                keyPassword = project.property("MYAPP_UPLOAD_KEY_PASSWORD") as String
            } else {
                storeFile = file("debug.keystore")
                storePassword = "android"
                keyAlias = "androiddebugkey"
                keyPassword = "android"
            }
        }
    }
    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("debug")
            applicationIdSuffix = ".dev"
            manifestPlaceholders["fileProvider"] =
                "com.noxplay.noxplayer.dev.provider"
        }
        getByName("release") {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = enableProguardInReleaseBuilds
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            manifestPlaceholders["fileProvider"] =
                "com.noxplay.noxplayer.provider"
        }
        create("stage") {
            initWith(getByName("release"))
            applicationIdSuffix = ".stage"
            manifestPlaceholders["fileProvider"] =
                "com.noxplay.noxplayer.stage.provider"
            matchingFallbacks.add("release")
            isMinifyEnabled = false
        }
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }
}

androidComponents {
    onVariants { variant ->
        // For each separate APK per architecture, set a unique version code as described here:
        // https://developer.android.com/studio/build/configure-apk-splits.html
        // Example: versionCode 1 will generate 1001 for armeabi-v7a, 1002 for x86, etc.
        val versionCodes = mapOf(
            "armeabi-v7a" to 1,
            "x86" to 2,
            "arm64-v8a" to 3,
            "x86_64" to 4,
        )
        variant.outputs.forEach { output ->
            val abi = output.filters
                .find {
                    it.filterType ==
                        com.android.build.api.variant.FilterConfiguration.FilterType.ABI
                }
                ?.identifier
            if (abi != null) {
                // null for the universal-debug, universal-release variants
                output.versionCode.set(
                    appVersionCode * 100 + versionCodes.getValue(abi),
                )
            }
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    coreLibraryDesugaring(apmLibs.desugar.jdk.libs)
    implementation(apmLibs.material)
    implementation(apmLibs.kotlinx.coroutines.guava)

    // For animated GIF support
    implementation(apmLibs.animated.gif)

    // For WebP support, including animated WebP
    implementation(apmLibs.animated.webp)
    implementation(apmLibs.webpsupport)

    implementation(apmLibs.appcompat.v7)
    implementation(apmLibs.support.annotations)
    implementation(apmLibs.design)

    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")
    implementation(apmLibs.media3.session)

    if (hermesEnabled) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation(jscFlavor)
    }
    implementation(apmLibs.core.ktx)
    implementation(apmLibs.core.google.shortcuts)
    implementation(apmLibs.tarsos.dsp.core)
    implementation(apmLibs.tarsos.dsp.jvm)
    // for po token generation - consider pulling the necessary interfaces OUT
    implementation(apmLibs.webkit)
    implementation(apmLibs.rxjava)
    implementation(apmLibs.rxandroid)
    implementation(apmLibs.nanojson)
    implementation(apmLibs.newpipeextractor)
}
