const targetFilename = 'payload.server.ts'

export default function loader(source) {
  const callback = this.async()

  const checkImports = (mod, visited = new Set()) => {
    if (visited.has(mod)) {
      return false
    }
    visited.add(mod)
    // Get the issuer module
    const issuer = this._compilation.moduleGraph.getIssuer(mod)
    if (!issuer) {
      return false
    }
    // Check if the issuer's resource path ends with the target filename
    if (issuer.resource.endsWith(targetFilename)) {
      return true
    }
    // Recursively check the issuer of the current module
    return checkImports(issuer, visited)
  }

  // if (source.startsWith("'use client'")) {
  if (checkImports(this._module)) {
    console.log(`Module ${this.resourcePath} is indirectly imported by ${targetFilename}`)
  }
  // }

  callback(null, source)
}
