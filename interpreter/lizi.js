const Canjs = require('./src/index.js')

new Canjs(`
  console.log('Hello World!')
`).run()

// const wx = {
//   name: 'wx'
// }

// new Canjs(`
//   console.log(wx.name)
// `, { wx }).run()