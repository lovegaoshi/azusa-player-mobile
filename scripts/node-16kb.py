import requests
import os
import zipfile
import logging
import hashlib
import shutil

URL = 'https://github.com/alzhuravlev/nodejs-mobile/releases/download/v18.20.4/nodejs-mobile-android.zip'
ANDROID_LIBNODE_SO = './node_modules/nodejs-mobile-react-native/android/libnode'
NODE_ZIP_PATH = 'node-mobile.zip'

def download_large_file(url, output_file):
    with requests.get(url, stream=True) as response:
        response.raise_for_status()  # Check for HTTP errors
        with open(output_file, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):  # 8 KB chunks
                if chunk:  # Filter out keep-alive chunks
                    file.write(chunk)

def calculate_md5(file_path):
    md5_hash = hashlib.md5()
    try:
        with open(file_path, "rb") as file:
            # Read the file in chunks to handle large files efficiently
            for chunk in iter(lambda: file.read(4096), b""):
                md5_hash.update(chunk)
        return md5_hash.hexdigest()
    except FileNotFoundError:
        return "File not found."
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == '__main__':
  logging.basicConfig(level=logging.DEBUG)
  import sys
  if not os.path.exists(NODE_ZIP_PATH):
    download_large_file(URL, NODE_ZIP_PATH)
  if not os.path.isdir('./node_modules/nodejs-mobile-react-native/android'):
    logging.error('npm install is not done!')
    sys.exit(1)
  shutil.rmtree(ANDROID_LIBNODE_SO)
  os.mkdir(ANDROID_LIBNODE_SO)
  with zipfile.ZipFile(NODE_ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(ANDROID_LIBNODE_SO)