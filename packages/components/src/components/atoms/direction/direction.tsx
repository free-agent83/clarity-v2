import * as React from "react"

export interface DirectionProviderProps {
  dir?: "ltr" | "rtl"
  children: React.ReactNode
}

/**
 * Provides a text direction context to its children.
 *
 * Wraps children in a `<div>` with the HTML `dir` attribute set
 * to either `"ltr"` or `"rtl"`, enabling right-to-left layout
 * for internationalized content.
 */
function DirectionProvider({ dir = "ltr", children }: DirectionProviderProps) {
  return <div dir={dir}>{children}</div>
}

DirectionProvider.displayName = "DirectionProvider"

export { DirectionProvider }
