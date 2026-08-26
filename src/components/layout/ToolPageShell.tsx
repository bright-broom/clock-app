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
    <main className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.1),transparent_42%)]" />
      <HomeUtilityMenu />
      <section className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-[1.5rem] border border-border bg-background-overlay p-6 backdrop-blur-[2px] sm:p-8">
          <nav className="mb-5 text-sm text-foreground-muted">
            <Link
              href={backHref}
              className="inline-flex min-h-[44px] items-center rounded-full border border-border px-4 transition-colors hover:bg-background-overlay-strong hover:text-foreground"
            >
              {backLabel}
            </Link>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {heading}
          </h1>
          <p className="mt-3 max-w-3xl text-foreground-muted">{description}</p>
          <section className="mt-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </section>
        </div>
      </section>
    </main>
  )
}
