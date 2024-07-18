import React from 'react'

import { config } from '../../../../dummyConfig'

const BloatedClientExample: React.FC = async () => {
  return (
    <React.Fragment>
      <h1>Hey!</h1>
      <p>{config.hi}</p>
    </React.Fragment>
  )
}

export default BloatedClientExample
