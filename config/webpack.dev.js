const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const commonConfig = require("./webpack.common");
const packageJson = require("../package.json");
// const express = require('express')
const PORT = 3001;
const deps = packageJson.dependencies
const path = require('path')
// const moduleConfig = require('./configuration.json')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const chokidar = require('chokidar')
const { readdirSync } = require('fs')

// function setRemoteModules () {
//   const modules = {}
//   Object.keys(moduleConfig).forEach((key) => {
//     modules[moduleConfig[key].scope] = `${moduleConfig[key].scope}@${moduleConfig[key].url}`
//     if (moduleConfig[key].children) {
//       Object.keys(moduleConfig[key].children).forEach(child => {
//         modules[moduleConfig[key].children[child].scope] = `${moduleConfig[key].children[child].scope}@${moduleConfig[key].children[child].url}`
//       })
//     }
//   })
//   console.log(`modules`, modules)
//   return modules
// }

function getPluginDirs() {
  let parent = __dirname.split('\\')
  parent.length = parent.length - 2
  parent = parent.join('/')
  const plugins = readdirSync(parent, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(i => ![".vscode", "template", "main"].includes(i))

  return plugins.map(plugin => path.join(__dirname, "..", "..", plugin, "src"))
}

const devConfig = {
  mode: "development",
  output: {
    publicPath: `http://localhost:${PORT}/`,
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devtool: "source-map",
  devServer: {
    port: PORT,
    historyApiFallback: true,
    static: path.join(__dirname, "build"),
    compress: true,
    liveReload: true,
    client: {logging: "none"},
    watchFiles: getPluginDirs()
    // setup(app) {
    //   app.use('/public/', express.static(path.join(__dirname, 'public')))
    // }
  },
  plugins: [
    new ReactRefreshPlugin(),
    // new ModuleFederationPlugin({
    //   name: "main",
    //   filename: 'remoteEntry.js',
    //   // remotes: setRemoteModules(),
    //   shared: {
    //     // ...deps,
    //     react: {
    //       singleton: true,
    //       requiredVersion: deps.react,
    //     },
    //     events: {eager: true, requiredVersion: deps.events},
    //   },
    // }),
  ],
};

module.exports = merge(commonConfig, devConfig);
