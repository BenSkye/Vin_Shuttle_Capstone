'use client'

import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import type Entity from '@ant-design/cssinjs/es/Cache'
import { useServerInsertedHTML } from 'next/navigation'
import { PropsWithChildren, useRef } from 'react'

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