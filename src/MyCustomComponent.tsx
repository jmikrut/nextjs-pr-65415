'use client'
import { useState } from 'react'

export const MyCustomComponent = () => {
  const [myState, setMyState] = useState('hello')

  return <h1>hello {myState}</h1>
}
