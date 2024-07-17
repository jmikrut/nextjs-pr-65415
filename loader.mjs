import swc from '@swc/core'

export default async function loader(source) {
  const callback = this.async()

  /**
   * Check if file is client component (either has use client, or some file in the chain has use client)
   */
  let isClientFile = false

  if (source.startsWith("'use client'")) {
    isClientFile = true
    if (this._module) {
      this._module.withinUseClient = true
    }
  }else {
    let current = this._module

    while (current) {
      if (current.withinUseClient) {
        isClientFile = true
        break
      }
      current = current.issuer
    }
  }


  /**
   * Check if any module in the parent chain is a special module (= server-only entry file)
   */
  let isSpecial = false
  let current = this._module

  while (current) {
    if (current.isSpecialModule) {
      isSpecial = true
      break
    }
    current = current.issuer
  }

  if(source.includes('MyCustomComponent')) {
    console.log('444444', isSpecial, isClientFile)
  }

  if (isSpecial && isClientFile) {
    console.log(`Module ${this.resourcePath} is loaded from a special module.`)

    const code = await (swc
      .transform(source, {
        filename: "input.js",
        sourceMaps: false,
        isModule: true,
        module: {
          type: 'es6'
        },
        jsc: {
          parser: {
            syntax: "ecmascript",
          },
          transform: {},
          experimental: {
            plugins: [
              [
                'swc-plugin-strip-components',
                {
                  identifier: 'Componendqwdjoqwpoqwjdt', // the name of the function whose props should be nullified
                  lobotomize_use_client_files: true
                }
              ]
            ]
          }
        },
      }))
    if(source.includes('MyCustomComponent')) {
      console.log({ source, code: code.code })
     source = 'export var MyCustomComponent = () => "worked"'
    }else {
      //source = code.code
      source = code.code.replace("'use client'", '')
    }

    console.log('Got cleaned', this.resourcePath)
    //console.log({ source, code: code.code })
    //source = 'module.exports = {}; export {}; export default {}'
  }

  callback(null, source)
}
