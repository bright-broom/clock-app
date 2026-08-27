import Link from 'next/link'
import type { ReactNode } from 'react'

import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import { HomeUtilityMenu } from './HomeUtilityMenu'

type Props = {
  backHref: string
  backLabel: string
  children: ReactNode
  description: string
  heading: string
}

export function ToolPageShell({
  backHref,
  backLabel,
  children,
  description,
  heading,
}: Props) {
  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,hsl(var(--color-fg-primary)/0.1),transparent_42%)]" />
      <HomeUtilityMenu />
      <section className="relative mx-auto flex min-h-[100svh] w-full max-w-5xl items-start px-3 pb-4 pt-[4.75rem] sm:px-6 sm:pb-6 sm:pt-[5.25rem] lg:items-center lg:py-[clamp(5rem,8vh,7rem)]">
        <div className="w-full rounded-[1.5rem] border border-border bg-background-overlay p-[clamp(1rem,2.36vw,2rem)] backdrop-blur-[2px]">
          <nav className="mb-3 text-sm text-foreground-muted">
            <Link
              href={backHref}
              className="inline-flex min-h-[44px] items-center rounded-full border border-border px-4 transition-colors hover:bg-background-overlay-strong hover:text-foreground"
            >
              {backLabel}
            </Link>
          </nav>
          <h1 className="text-[clamp(1.5rem,4vw,1.875rem)] font-semibold tracking-tight text-foreground">
            {heading}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-foreground-muted sm:text-base">
            {description}
          </p>
          <section className="mt-[clamp(1.25rem,3vh,2rem)]">
            <ErrorBoundary>{children}</ErrorBoundary>
          </section>
        </div>
      </section>
    </main>
  )
}
