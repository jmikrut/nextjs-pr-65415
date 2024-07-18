import * as util from 'node:util'

export class ModuleIssuerCheckPlugin {
  constructor(options) {
    this.targetFilename = options.targetFilename;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ModuleIssuerCheckPlugin', (compilation) => {
      compilation.hooks.succeedModule.tap('ModuleIssuerCheckPlugin', (module) => {
        if(!module.resource) {
          return;
        }
        const debug = module.resource.includes('MyCustomComponent');

        // Function to check imports recursively
        const checkImports = (mod, visited = new Set()) => {
          if(debug && visited.size === 0) {
            console.log(`\n\n\ncheckImports ${module.resource}`, compilation.moduleGraph.moduleMap?.size)
          }
          if (visited.has(mod)) {
            return false;
          }
          visited.add(mod);
          const issuer = compilation.moduleGraph.getIssuer(mod);
          if(debug) {
            console.log(`\nissuer "` + issuer?.resource+'"'/*, issuer*/)
            //console.log(util.inspect(issuer, { depth: null }));

            if(!issuer?.resource || !issuer?.resource?.length) {
              console.log('Empty issuer');
              //console.log(util.inspect(issuer, { depth: null }));

            }
          }
          if (!issuer) {
            return false;
          }
          if (issuer.resource && issuer.resource.endsWith(this.targetFilename)) {
            if(debug) {
              console.log('true', issuer.resource, this.targetFilename);

            }
            return true;
          }
          return checkImports(issuer, visited);
        };


        // Check if the current module is imported by the target
        if (checkImports(module)) {
          console.log(`Module ${module.resource} is indirectly imported by ${this.targetFilename}`);
          // Here you can modify the module, apply transformations, etc.
        }
      });
    });
  }
}


