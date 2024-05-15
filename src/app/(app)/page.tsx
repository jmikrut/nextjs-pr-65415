import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'

// Note that we are importing the Payload config here
// which tells Payload about everything it needs to do
// including admin panel and route handlers, db, etc
import config from '@payload-config'

// See the next.config.mjs in this repo -
// if we could mark certain dependencies as server-only,
// then here, we could import the server-only config,
// and no client-side dependencies would be unnecessarily added to the resulting
// JS for this page.

// import config from '../../../server-only'

// This is a server component, which renders zero client components
// but if you look at the generated client JS, it's big
// because all client components from the payload config are automatically
// included.

// But if you build this repo, look at the / first load JS. It's 355kb
// because we imported the Payload config.

// we need a way to opt OUT of any automatic client inclusions for specific
// dependencies (https://github.com/vercel/next.js/pull/65415)
const BloatedClientExample: React.FC = async () => {
  const payload = await getPayloadHMR({ config })

  const { docs } = await payload.find({
    collection: 'pages',
  })

  if (docs.length === 0) {
    return <p>No docs found</p>
  }

  return (
    <React.Fragment>
      <h1>Pages</h1>
      <ul>
        {docs.map((doc) => {
          return <li key={doc.id}>{doc.title}</li>
        })}
      </ul>
    </React.Fragment>
  )
}

export default BloatedClientExample
