---
sidebar_position: 1
---

# Developing APM

APM is written in react-native. To develop, download and install:

npm (node 18+)

yarn (yarn v1)

xcode/android studio

git

then run the following command:

## Build via Github Actions

android-release.yml monitors pushes with tags v{x.y.z} and automatically build and release.
android-weekly runs weekly or manually to publish a release. For nightly or publishing a dev version, this is it.

## Versioning

versions are located in `Version.ts` and `build.gradle`. APM automatically updates storage to the app's version, and uses this version number to compare for new updates. [Semantic versioning](https://semver.org/) is recommended.
