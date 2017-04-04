const fs = require('fs')
const path = require('path')
const glob = require('glob')
const gulp = require('gulp')
const exec = require('child_process').execSync

const jupyterSrc = path.resolve(__dirname, './nbs')
const jupyterDst = path.resolve(__dirname, './static/nbs')

gulp.task('build:nbs', () => {
  const nbs = glob.sync(`${jupyterSrc}/**/*.ipynb`)
  for (let i = 0; i < nbs.length; i += 1) {
    const basename = path.basename(nbs[i])
    exec(`jupyter nbconvert --to html --template basic \
    --output-dir ${nbs[i].replace(jupyterSrc, jupyterDst).replace(basename, '')} \
    ${nbs[i]}`)
  }
})

gulp.task('watch:nbs', () => {
  gulp.watch(`${jupyterSrc}/**/*.ipynb`, file => {
    const filePath = file.path
    const basename = path.basename(filePath)
    exec(`jupyter nbconvert --to html --template basic \
    --output-dir ${file.path.replace(jupyterSrc, jupyterDst).replace(basename, '')} \
    ${filePath}`)
  })
})

gulp.task('build:data', () => {
  const nbs = {}
  const walkDirectory = (path, obj) => {
    const dir = fs.readdirSync(path)
    for (let i = 0; i < dir.length; i++) {
      const name = dir[i]
      const target = path + '/' + name
      const stats = fs.statSync(target)
      if (stats.isFile()) {
        const content = fs.readFileSync(target)
        obj[name] = String(content)
      } else if (stats.isDirectory()) {
        obj[name] = {}
        walkDirectory(target, obj[name])
      }
    }
  }
  walkDirectory(jupyterDst, nbs)
  fs.writeFileSync('nbs.json', JSON.stringify(nbs))
})
