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

  isImportedFromFile(compilation, mod) {
    const checkImports = (moduleToCheck, visited = new Set()) => {
      if (visited.has(moduleToCheck)) {
        return false
      }

      visited.add(moduleToCheck)

      const issuer = compilation.moduleGraph.getIssuer(moduleToCheck)

      if (!issuer) {
        console.log('no issuer', moduleToCheck)
        return false
      }

      if (issuer.resource && issuer.resource.endsWith(this.targetFilename)) {
        return true
      }

      return checkImports(issuer, visited)
    }

    return checkImports(mod)
  }

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
