package com.nativenoxmodule

import android.util.Log
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NativeNoxModulePackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        Log.d("APM", "getting module: $name, ${NativeNoxModule.NAME}, ${name == NativeNoxModule.NAME}")
        return if (name == NativeNoxModule.NAME) {
            NativeNoxModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeNoxModule.NAME to ReactModuleInfo(
                name = NativeNoxModule.NAME,
                className = NativeNoxModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}