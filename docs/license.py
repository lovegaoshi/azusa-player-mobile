packages = '''
@react-native-community/slider
@react-native-cookies/cookies
@react-navigation/drawer
@react-navigation/material-top-tabs
@react-navigation/native
@react-navigation/native-stack
@shopify/flash-list
axios
babel-plugin-transform-remove-console
bottleneck
deepmerge
dropbox
fflate
i18next
md5
react
react-i18next
react-native
react-native-app-auth
react-native-background-timer
react-native-blob-jsi-helper
react-native-countdown-circle-timer
react-native-draggable-flatlist
react-native-fast-image
react-native-gesture-handler
react-native-lyric
react-native-pager-view
react-native-paper
react-native-qrcode-svg
react-native-reanimated
react-native-safe-area-context
react-native-screens
react-native-snackbar
react-native-svg
react-native-tab-view
react-native-track-player
react-native-url-polyfill
react-native-vector-icons
react-native-video
react-native-windows
react-use
use-debounce
zustand'''

import requests

def get_repository_info(package_name):
    # Search for the repository using GitHub API
    url = f"https://api.github.com/search/repositories?q={package_name}+in:name"
    print(url)
    headers = {"Accept": "application/vnd.github.v3+json"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data["total_count"] > 0:
            # Get the first repository from the search results
            repository = data["items"][0]
            repo_name = repository["name"]
            repo_url = repository["html_url"]
            repo_license = get_repository_license(repository["full_name"])

            return {
                "package_name": package_name,
                "repository_url": repo_url,
                "license": repo_license
            }
        else:
            return None
    else:
        print(f"Failed to retrieve repository information for {package_name}. Error: {response.status_code}")
        return None

def get_repository_license(repo_name):
    # Get the repository information using GitHub API
    url = f"https://api.github.com/repos/{repo_name}"
    headers = {"Accept": "application/vnd.github.v3+json"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data["license"] is not None and "name" in data["license"]:
            return data["license"]["name"]
        else:
            return "Unknown"
    else:
        print(f"Failed to retrieve license information for {repo_name}. Error: {response.status_code}")
        return "Unknown"

data = {}
import time
for package_name in packages.split('\n'):
    info = get_repository_info(package_name)
    if info is not None:
        data[package_name] = {
            'repo': info['repository_url'],
            'license': info['license'],
        }
    time.sleep(10)
import json
with open('data.json', 'w') as f:
    json.dump(data, f)

for package_name in packages.split('\n'):
    if package_name in data:
        print(f'[{package_name}]({data[package_name]["repo"]}): {data[package_name]["license"]}')
    else:
        print(f'[{package_name}](): ')