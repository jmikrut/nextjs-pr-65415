import { getProxiedPluginState } from 'next/dist/build/build-context.js'

const targetFilename = 'payload.server.ts'
// should log checkImports /Users/alessio/Documents/GitHub/nextjs-pr-65415/src/MyCustomComponent.tsx ModuleGraph 2352 modulemap   _dependencyMap: WeakMap { <items unknown> },


export default function loader(source) {
  const callback = this.async()


  const checkImports = (debug, mod, visited = new Set()) => {
    if(debug && visited.size === 0) {
      console.log(`\n\n\ncheckImports ${this.resourcePath}`, this._compilation.moduleGraph._moduleMap.size)
    }
    if (visited.has(mod)) {
      return false
    }
    visited.add(mod)
    // Get the issuer module
    const issuer = this._compilation.moduleGraph.getIssuer(mod)
    if(debug) {
      console.log(`\nissuer "` + issuer?.resource+'"'/*, issuer*/)
    }
    if (!issuer) {
      return false
    }
    // Check if the issuer's resource path ends with the target filename
    if (issuer.resource.endsWith(targetFilename)) {
      console.log('true',issuer.resource, targetFilename )
      return true
    }
    // Recursively check the issuer of the current module
    return checkImports(debug, issuer, visited)
  }


  const debug = source.includes('MyCustomComponent') && !this.resourcePath.includes('payload.config.ts')


  const cir = checkImports(debug, this._module)
  if(debug) {
    console.log('checkImports result', cir)
  }
  // if (source.startsWith("'use client'")) {
  if (cir) {
    console.log(`Module ${this.resourcePath} is indirectly imported by ${targetFilename}`)
  }
  // }

  callback(null, source)
}
