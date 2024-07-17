export default function loader(source) {
  const callback = this.async()

  // Use Webpack's normal module hook to tag this module
  if (this._module) {
    this._module.isSpecialModule = true
  }

  callback(null, source)
}
