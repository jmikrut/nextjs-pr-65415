import { getProxiedPluginState } from 'next/dist/build/build-context.js'
import { parse } from 'node:querystring'

const PLUGIN_NAME = 'RemoveUnusedPayloadClientDeps'

const pluginState = getProxiedPluginState({})

const filterKeys = [
  'app-pages-internals',
  'app/(payload)/layout',
  'app/(payload)/admin/[[...segments]]/not-found',
  'app/(payload)/admin/[[...segments]]/page',
]

export class RemoveUnusedPayloadClientDeps {
  constructor(options) {
    this.targetFilename = options.targetFilename
  }

  // isImportedFromEntry(compilation, mod, entry) {
  //   const checkImports = (moduleToCheck, visited = new Set()) => {
  //     if (visited.has(moduleToCheck)) {
  //       return false
  //     }

  //     visited.add(moduleToCheck)

  //     // Get the issuer module
  //     const issuer = compilation.moduleGraph.getIssuer(moduleToCheck)

  //     if (!issuer) {
  //       return false
  //     }

  //     // Check if the issuer's resource path ends with the target filename
  //     if (issuer.resource && issuer.resource.endsWith(this.targetFilename)) {
  //       return true
  //     }

  //     // Recursively check the issuer of the current module
  //     return checkImports(issuer, visited)
  //   }

  //   // Get the entry module and its dependencies
  //   const entryModule = compilation.entries.get(entry)
  //   if (!entryModule) {
  //     throw new Error(`Entry ${entry} not found in the compilation.`)
  //   }

  //   // Collect all modules for the given entry point
  //   const entryModules = new Set()

  //   const collectModules = (moduleToCheck) => {
  //     if (entryModules.has(moduleToCheck)) {
  //       return
  //     }

  //     entryModules.add(moduleToCheck)

  //     // Get the dependencies of the module
  //     const dependencies = compilation.moduleGraph.getOutgoingConnections(moduleToCheck)
  //     dependencies.forEach((connection) => {
  //       const mod = compilation.moduleGraph.getModule(connection)

  //       if (mod) {
  //         collectModules(mod)
  //       }
  //     })
  //   }

  //   const modToCollect = compilation.moduleGraph.getModule(entryModule.dependencies[0])

  //   collectModules(modToCollect)

  //   // Check if the module is within the collected entry modules and perform the import check
  //   if (!entryModules.has(mod)) {
  //     return false
  //   }

  //   return checkImports(mod)
  // }

  isImportedFromFile(compilation, mod, entry) {
    const checkImports = (moduleToCheck, visited = new Set()) => {
      if (visited.has(moduleToCheck)) {
        return false
      }

      visited.add(moduleToCheck)

      // Get the issuer module
      const issuer = compilation.moduleGraph.getIssuer(moduleToCheck)

      if (!issuer) {
        return false
      }

      // Check if the issuer's resource path ends with the target filename
      if (issuer.resource && issuer.resource.endsWith(this.targetFilename)) {
        return true
      }

      // Recursively check the issuer of the current module
      return checkImports(issuer, visited)
    }

    // Get the entry module and its dependencies
    const entryModule = compilation.entries.get(entry)
    if (!entryModule) {
      throw new Error(`Entry ${entry} not found in the compilation.`)
    }

    // Collect all modules for the given entry point
    const entryModules = new Set()
    const collectModules = (moduleToCheck) => {
      if (entryModules.has(moduleToCheck)) {
        return
      }

      entryModules.add(moduleToCheck)

      // Get the dependencies of the module
      const dependencies = compilation.moduleGraph.getOutgoingConnections(moduleToCheck)
      dependencies.forEach((connection) => {
        const mod = compilation.moduleGraph.getModule(connection)

        if (mod) {
          collectModules(mod)
        }
      })
    }

    const modToCollect = compilation.moduleGraph.getModule(entryModule.dependencies[0])
    collectModules(modToCollect)

    // Check if the module is within the collected entry modules and perform the import check
    if (!entryModules.has(mod)) {
      return false
    }

    return checkImports(mod)
  }

  // isImportedFromServerOnly(compilation, mod, entry) {
  //   // Function to traverse the dependency graph
  //   const checkImports = (moduleToCheck, visited = new Set()) => {
  //     if (visited.has(moduleToCheck)) {
  //       return false
  //     }

  //     visited.add(moduleToCheck)
  //     // Get the issuer module
  //     const issuer = compilation.moduleGraph.getIssuer(moduleToCheck)

  //     if (!issuer) {
  //       return false
  //     }

  //     // Check if the issuer's resource path ends with the target filename
  //     if (issuer.resource.endsWith(this.targetFilename)) {
  //       return true
  //     }
  //     // Recursively check the issuer of the current module
  //     return checkImports(issuer, visited)
  //   }

  //   // Check if the current module or any of its issuers were imported by the target module
  //   return checkImports(mod)
  // }

  async parseClientEntries(clientEntries) {
    const filteredClientEntries = Object.entries(clientEntries).reduce((acc, [key, value]) => {
      if (!filterKeys.includes(key)) {
        acc[key] = value
      }
      return acc
    }, {})

    for (const [key, value] of Object.entries(filteredClientEntries)) {
      const queryString = value.split('next-flight-client-entry-loader?')[1]
      const parsed = parse(queryString)

      if (!parsed.modules) {
        continue
      }

      let modules

      if (Array.isArray(parsed.modules)) {
        modules = parsed.modules.map((x) => JSON.parse(x))
      } else {
        modules = [JSON.parse(parsed.modules)]
      }

      if (modules) {
        filteredClientEntries[key] = modules
      }
    }

    return filteredClientEntries
  }

  apply(compiler) {
    compiler.hooks.finishMake.tap(PLUGIN_NAME, async (compilation) => {
      const parsed = await this.parseClientEntries(pluginState?.injectedClientEntries)
      const modules = Array.from(compilation.modules)

      Object.entries(parsed).forEach(([entry, clientEntries]) => {
        if (Array.isArray(clientEntries)) {
          clientEntries.forEach(({ request }) => {
            const targetModule = Array.from(modules).find((mod) => mod.resource === request)

            if (targetModule) {
              const isImported = this.isImportedFromFile(compilation, targetModule, entry)

              if (isImported) {
                console.log(request)
              }
            }
          })
        }
      })

      return
    })
  }
}
