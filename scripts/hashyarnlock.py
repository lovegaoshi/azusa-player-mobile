import hashlib

def file_ends_in_newline(file_path):
  with open(file_path, 'rb') as f:
    if f.read().endswith(b'\n'):
      return ''
    return '\n'

if __name__ == '__main__':
    lockhash = hashlib.md5(
      open('yarn.lock','rb').read(), usedforsecurity=False).hexdigest()
    import os
    os.makedirs('bundles', exist_ok=True)
    with open('./bundles/yarn.hash','a') as f: 
        f.write(lockhash)
    with open('.env','a') as f:
        f.write(f'{file_ends_in_newline(".env")}LOCKHASH={lockhash}')