import * as util from 'node:util'
import { getProxiedPluginState } from 'next/dist/build/build-context.js'
import { parse } from 'node:querystring'
import * as fs from 'node:fs'

const PLUGIN_NAME = 'RemoveUnusedPayloadClientDeps'

const pluginState = getProxiedPluginState({
})
export class RemoveUnusedPayloadClientDeps {
  constructor(options) {
    this.targetFilename = options.targetFilename
  }

  apply(compiler) {
    compiler.hooks.finishMake.tap(
      PLUGIN_NAME,
      async (compilation) => {
        console.log('pluginState?.injectedClientEntries', pluginState?.injectedClientEntries)

        // write pluginState?.injectedClientEntries to file.txt


        if(pluginState?.injectedClientEntries && Object.keys(pluginState?.injectedClientEntries)?.length) {
          fs.writeFileSync('file.txt', JSON.stringify(pluginState?.injectedClientEntries))

          for(const values of Object.values(pluginState.injectedClientEntries)) {
            const stringifiedQueryString = values.split('next-flight-client-entry-loader?')[1]
            const parsed = parse(stringifiedQueryString)
            console.log('\n\nfirstValues', parsed.modules)
          }

        }

        //console.log(pluginState?.serverModuleIds ? Object.keys(pluginState?.serverModuleIds)?.length : 0, pluginState?.injectedClientEntries && Object.keys(pluginState?.injectedClientEntries)?.length ? Object.values(pluginState.injectedClientEntries)[0]  : 0)
        return
      },
      // this.createClientEntries(compiler, compilation),
    )

    // compiler.hooks.thisCompilation.tap('ModuleIssuerCheckPlugin', (compilation) => {
    //   compilation.hooks.succeedModule.tap('ModuleIssuerCheckPlugin', (module) => {
    //     if(!module.resource) {
    //       return;
    //     }
    //     const debug = module.resource.includes('MyCustomComponent');

    //     // Function to check imports recursively
    //     const checkImports = (mod, visited = new Set()) => {
    //       if(debug && visited.size === 0) {
    //         console.log(`\n\n\ncheckImports ${module.resource}`, compilation.moduleGraph.moduleMap?.size)
    //       }
    //       if (visited.has(mod)) {
    //         return false;
    //       }
    //       visited.add(mod);
    //       const issuer = compilation.moduleGraph.getIssuer(mod);
    //       if(debug) {
    //         console.log(`\nissuer "` + issuer?.resource+'"'/*, issuer*/)
    //         //console.log(util.inspect(issuer, { depth: null }));

    //         if(!issuer?.resource || !issuer?.resource?.length) {
    //           console.log('Empty issuer');
    //           //console.log(util.inspect(issuer, { depth: null }));

    //         }
    //       }
    //       if (!issuer) {
    //         return false;
    //       }
    //       if (issuer.resource && issuer.resource.endsWith(this.targetFilename)) {
    //         if(debug) {
    //           console.log('true', issuer.resource, this.targetFilename);

    //         }
    //         return true;
    //       }
    //       return checkImports(issuer, visited);
    //     };

    //     // Check if the current module is imported by the target
    //     if (checkImports(module)) {
    //       console.log(`Module ${module.resource} is indirectly imported by ${this.targetFilename}`);
    //       // Here you can modify the module, apply transformations, etc.
    //     }
    //   });
    // });
  }
}
