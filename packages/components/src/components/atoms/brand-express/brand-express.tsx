import * as React from "react"
import { useId } from "react"

import { cn } from "@/lib/utils"

interface BrandExpressProps extends React.ComponentProps<"svg"> {}

/**
 * Nivoda Express wordmark.
 *
 * Renders the Express brand mark as an inline SVG with its fixed
 * pink→red gradient baked in — the gradient is part of the mark's
 * identity and is not themeable. Unlike `Brand`, which inherits
 * `currentColor`, recolouring Express is a design ruling.
 *
 * Sized via standard Tailwind height utilities on `className`:
 *
 * ```tsx
 * <BrandExpress />                // 20px tall (default)
 * <BrandExpress className="h-6" /> // 24px tall
 * ```
 *
 * Width scales automatically with the viewBox's aspect ratio.
 *
 * Defaults `role="img"` and `aria-label="Nivoda Express"`. Pass
 * `aria-hidden` when a visible "Express" label accompanies the mark
 * to avoid duplicate announcements.
 */
function BrandExpress({ className, ...props }: BrandExpressProps) {
  const gradientId = useId()
  return (
    <svg
      data-slot="brand-express"
      viewBox="0 0 246 42"
      role="img"
      aria-label="Nivoda Express"
      className={cn("h-5 w-auto", className)}
      {...props}
    >
      <path
        fill={`url(#${gradientId})`}
        d="M29.8706 3.45842V9.4633H9.60049V17.626H29.6363V23.4063H9.60049V32.5357H30.0073V38.5406H3V3.45842H29.8706ZM69.2197 3.45842L55.8332 20.6529L69.5907 38.5406H61.9748L51.5175 24.9686L40.8747 38.5406H33.9911L48.0708 20.4283L35.0553 3.45842H42.5736L52.2498 16.0736L62.4337 3.45842H69.2197ZM91.5501 3.45842C99.0293 3.45842 102.925 8.18421 102.925 14.2379C102.925 20.2916 99.2539 25.1932 91.5989 25.1932H81.415V38.5406H74.7657V3.45842H91.5501ZM81.415 19.5105H91.5012C95.0358 19.5105 96.6371 17.1281 96.6371 14.4625C96.6371 11.7969 95.0358 9.4633 91.5012 9.4633H81.415V19.5105ZM126.037 3.45842C133.555 3.45842 137.002 8.22327 137.002 13.5935C137.002 17.587 135.117 21.3461 130.86 22.8986L140.81 38.5406H133.379L124.211 23.6797H115.677V38.5406H109.076V3.45842H126.046H126.037ZM115.677 19.0516H124.943C128.751 19.0516 130.352 16.8547 130.352 14.2867C130.352 11.7188 128.702 9.47307 124.943 9.47307H115.677V19.0516ZM172.67 3.45842V9.4633H152.4V17.626H172.435V23.4063H152.4V32.5357H172.806V38.5406H145.799V3.45842H172.67ZM205.867 11.709C201.972 10.0101 197.109 8.731 192.93 8.731C188.341 8.731 185.5 10.2932 185.5 13.2225C185.5 15.2436 186.876 16.3372 190.177 17.3038C192.608 18.0361 198.613 19.4129 201.962 20.6529C206.551 22.3518 208.699 24.6464 208.699 28.7668C208.699 35.1427 203.563 38.9897 194.16 38.9897C190.167 38.9897 183.342 38.3063 178.518 35.7383L179.895 30.2314C184.299 32.3404 190.391 33.2583 194.248 33.2583C199.57 33.2583 202.04 31.5203 202.04 28.5325C202.04 26.1891 200.478 25.2322 197.548 24.4023C195.068 23.7188 190.577 22.8889 186.447 21.3754C181.448 19.5398 178.88 17.3429 178.88 12.9393C178.88 6.33881 184.748 2.98975 193.321 2.98975C198.232 2.98975 203.046 4.09308 207.215 6.20211L205.838 11.709H205.867ZM241.086 11.709C237.19 10.0101 232.328 8.731 228.159 8.731C223.57 8.731 220.728 10.2932 220.728 13.2225C220.728 15.2436 222.105 16.3372 225.405 17.3038C227.836 18.0361 233.841 19.4129 237.19 20.6529C241.78 22.3518 243.928 24.6464 243.928 28.7668C243.928 35.1427 238.792 38.9897 229.389 38.9897C225.395 38.9897 218.57 38.3063 213.757 35.7383L215.133 30.2314C219.537 32.3404 225.64 33.2583 229.487 33.2583C234.808 33.2583 237.278 31.5203 237.278 28.5325C237.278 26.1891 235.716 25.2322 232.787 24.4023C230.307 23.7188 225.815 22.8889 221.685 21.3754C216.686 19.5398 214.118 17.3429 214.118 12.9393C214.118 6.33881 219.986 2.98975 228.559 2.98975C233.47 2.98975 238.284 4.09308 242.453 6.20211L241.077 11.709H241.086Z"
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="3"
          y1="20.9946"
          x2="243.937"
          y2="20.9946"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.47" stopColor="#DB2777" />
          <stop offset="1" stopColor="#E02C42" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export { BrandExpress }
export type { BrandExpressProps }
