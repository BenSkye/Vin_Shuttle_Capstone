import { useState, useEffect } from 'react'

export function useDelayedLoading(delay: number = 1000) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, delay)

        return () => clearTimeout(timer)
    }, [delay])

    return isLoading
} 