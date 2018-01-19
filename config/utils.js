var path = require('path')
var glob = require('glob')
var config = require('../config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
const pkg = require(process.cwd() + '/package.json')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

//获取模块路径
exports.getModule = () => {
  return process.cwd() + '/modules'
}

//获取子模块路径, 如modules/views/test
exports.getModulePath = (moduleName) => {
  return process.cwd() + '/modules/src/' + moduleName
}

//获取子模块的入口文件，如{test: modules/views/test/main.js, test1: modules/views/test1/main.js}
exports.getEntries = () => {
  var entries = null
  if(process.env.NODE_ENV == 'development') {
    entries = glob.sync('./modules/src/**/main.js')
      .reduce(function (entries, entry) {
        console.log(entry)
        // 各模块入口文件地址，eg: ./modules/src/test/main.js
        let moduleName = entry.match(/src\/(.*)\/main.js/)[1]
        entries[moduleName] = entry
        return entries
      }, {})
  } else {
    entries = {}
    var modules = process.argv[2].split(':')
    modules.forEach(moduleName => {
      entries[moduleName] = exports.getModulePath(moduleName) + '/main.js'
    })
  }
  //console.log(JSON.stringify(entries))
  return entries
}

//获取子模块的模板文件
exports.getModuleTemplate = (moduleName) => {
  return 'modules/src/' + moduleName + '/index.html'
}
//获取生成的文件
exports.getOuputFileName = (moduleName) => {
  return process.cwd() + `/${moduleName}/index.html`
}

exports.createNotifierCallback = function () {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') {
      return
    }
    const error = errors[0]

    const filename = error.file.split('!').pop()
    notifier.notify({
      title: pkg.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
