---
sidebar_position: 1
---

# Developing APM

APM is written in react-native. With some react or web dev experience you can start in no time. To develop, download and install if you havent already:

```
npm (node 22)

yarn (yarn v4)`

xcode/android studio

git
```

Then run the following:

```
git clone https://github.com/lovegaoshi/azusa-player-mobile.git
yarn build
yarn
```

For iOS development, run

`cd ios && pod install && cd ..`

and follow iOS compilation instructions [here](https://github.com/lovegaoshi/azusa-player-mobile/issues/34).

# Compile, Versioning and Release

APM has an automatic android compile action in `android-weekly.yml` that builds and releases on manual trigger, weekly on main, and push from dev as a pre-release package.

APM uses semantic versioning.

When releasing, edit the app version in `version.ts` and `androidManifest.xml`, then push to main with a `v{x}.{y}.{z}` tag. `android-release.yml` will release as the latest package.
