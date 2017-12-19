const path = require('path')
const dir = require('node-dir')
const qiniu = require('qiniu')

const BASE = path.resolve(__dirname, 'dist')
const { name: NAME, version: VERSION } = require('./dist/manifest')
const {
  npm_package_deploy_BUCKET: BUCKET,
  npm_package_deploy_ACCESS_KEY: ACCESS_KEY,
  npm_package_deploy_SECRET_KEY: SECRET_KEY,
} = process.env

qiniu.conf.ACCESS_KEY = ACCESS_KEY
qiniu.conf.SECRET_KEY = SECRET_KEY

dir.files(BASE, (err, files) => {
  if (err) return console.error(err)

  return files.forEach(file => {
    const KEY = file.replace(BASE, `${NAME}/${VERSION}`)
    const TOKEN = new qiniu.rs.PutPolicy(`${BUCKET}:${KEY}`).token()
    const EXTRA = new qiniu.io.PutExtra()

    qiniu.io.putFile(TOKEN, KEY, file, EXTRA, (err, res) => {
      if (err) return console.error(err)

      return console.log(res.hash, res.key)
    })
  })
})
