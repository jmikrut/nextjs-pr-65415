class MarkSpecialModulePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MarkPayloadServerOnly', (compilation) => {
      compilation.hooks.normalModuleLoader.tap('MarkPayloadServerOnly', (loaderContext, mod) => {
        if (mod.resource && /payload\.server\.ts$/.test(mod.resource)) {
          mod.isSpecialModule = true
        }
      })
    })
  }
}

export default MarkSpecialModulePlugin
