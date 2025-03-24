import { useDebouncedCallback as useDebouncedCallbackLib } from 'use-debounce'

export const DEBOUNCE_DELAY = 250
export const DEBOUNCE_OPTIONS = { leading: true, trailing: false }

export const useDebouncedCallback = (func, delay = DEBOUNCE_DELAY, options = DEBOUNCE_OPTIONS) =>
  useDebouncedCallbackLib(func, delay, options)
