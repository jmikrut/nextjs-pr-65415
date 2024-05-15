import { withPayload } from '@payloadcms/next/withPayload'
// import path from 'path'
// import { fileURLToPath } from 'url'

// const filename = fileURLToPath(import.meta.url)
// const dirname = path.dirname(filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE:
  // here is our proposed solution in PR https://github.com/vercel/next.js/pull/65415
  // We mark a file as a server-only dependency, so that when it is imported,
  // Next.js build process just does not add any client dependencies for that one import
  // experimental: {
  //   serverOnlyDependencies: [path.resolve(dirname, './server-config.ts')],
  // },
}

export default withPayload(nextConfig)
