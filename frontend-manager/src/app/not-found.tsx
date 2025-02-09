'use client'

import Error from 'next/error'

export default function NotFound() {
    return (
        <html lang='en'>
            <Error statusCode={404} />
        </html>
    )
}