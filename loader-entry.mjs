export default function loader(source) {
  const callback = this.async()
  console.log('Loader entry')

  // Use Webpack's normal module hook to tag this module
  if (this._module) {
    this._module.isSpecialModule = true
    console.log('is special module', this.resourcePath)
  }

  callback(null, source)
}
