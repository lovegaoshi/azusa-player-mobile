import hashlib

with open('./bundles/yarn.hash','w') as f: 
  f.write(hashlib.md5(open('yarn.lock','rb').read()).hexdigest())
