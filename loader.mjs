export default function loader(source) {
  const callback = this.async()

  if (source.startsWith("'use client'")) {
    // Check if any module in the parent chain is a special module
    let isSpecial = false
    let current = this._module

    while (current) {
      if (current.isSpecialModule) {
        isSpecial = true
        break
      }
      current = current.issuer
    }

    if (isSpecial) {
      // here, we need to use the `empty-loader` to return an empty module and short-circuit
      console.log(`Module ${this.resourcePath} is loaded from a special module.`)
    } else {
      // console.log(`Module ${this.resourcePath} is not loaded from a special module.`)
    }
  }

  callback(null, source)
}
