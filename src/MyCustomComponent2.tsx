'use client'
import { useState } from 'react'

// if webpack comes across the same MyCustomComponent twice, the moduleGraph is fucked. Prob some caching, but it cannot be traced properly anymore.

export const MyCustomComponent2 = () => {
  const [myState, setMyState] = useState('hello')

  return 'test'
}

export const test = 'hi'
