'use client'

import { PropsWithChildren, useRef } from 'react'

import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import type Entity from '@ant-design/cssinjs/es/Cache'
import { useServerInsertedHTML } from 'next/navigation'

export function AntdRegistry({ children }: PropsWithChildren) {
  const cache = useRef<Entity | null>(null)

  useServerInsertedHTML(() => {
    // Prevent registration of duplicate styles during streaming
    if (!cache.current) {
      return null
    }
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache.current)}<script>`,
        }}
      />
    )
  })

  if (!cache.current) {
    cache.current = createCache()
  }

  return <StyleProvider cache={cache.current}>{children}</StyleProvider>
}
