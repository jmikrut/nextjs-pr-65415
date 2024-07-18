import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'
import { ModuleIssuerCheckPlugin } from './newplugin.mjs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE:
  // here is our proposed solution in PR https://github.com/vercel/next.js/pull/65415
  // We mark a file as a server-only dependency, so that when it is imported,
  // Next.js build process just does not add any client dependencies for that one import
  // experimental: {
  //   serverOnlyDependencies: [path.resolve(dirname, './server-config.ts')],
  // },
  webpack: (config, { isServer }) => {
    config.cache = false
    config.optimization.concatenateModules = false
    config.optimization.providedExports = false
    config.optimization.usedExports = false
    config.optimization.sideEffects = false

/*
    config.module.rules.push({
      test: /\.(ts|js)x?$/,
      enforce: 'pre',
      use: [
        {
          loader: path.resolve(dirname, './newloader.mjs'),
        },
      ],
    })
*/

    config.plugins.push(new ModuleIssuerCheckPlugin({
      targetFilename: 'payload.server.ts'
    }))

    if (true) {
      console.log('Building')
      /*config.module.rules.push({
        test: /\.(ts|js)x?$/,
        enforce: 'pre',
        use: [
          {
            loader: path.resolve(dirname, './loader.mjs'),
          },
        ],
      })

      config.module.rules.push({
        test: /payload\.server\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: path.resolve(dirname, './loader-entry.mjs'),
          },
        ],
      })
    }*/
    }
    //console.log('config.module.rules', config.module.rules)

    return config
  },
}

export default withPayload(nextConfig)
