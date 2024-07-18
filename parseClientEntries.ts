import * as fs from 'node:fs'
import { parse } from 'node:querystring'

export const parseClientEntries = async (clientEntries: { [key: string]: string }) => {
  const filterKeys = [
    'app-pages-internals',
    'app/(payload)/layout',
    'app/(payload)/admin/[[...segments]]/not-found',
    'app/(payload)/admin/[[...segments]]/page',
  ]
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

    const modules = parsed.modules.map((x: string) => JSON.parse(x))

    console.log('parsed', modules)
  }
}

const clientEntries = fs.readFileSync('file.json', 'utf-8')

await parseClientEntries(JSON.parse(clientEntries))
