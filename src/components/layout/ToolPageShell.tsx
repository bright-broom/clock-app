import Link from 'next/link'
import type { ReactNode } from 'react'

import { BackIcon } from '@/components/ui/AppIcons'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import { HomeUtilityMenu } from './HomeUtilityMenu'

type Props = {
  backHref: string
  backLabel: string
  children: ReactNode
  description?: string
  heading: string
  layout?: 'editorial' | 'focused'
}

export function ToolPageShell({
  backHref,
  backLabel,
  children,
  description,
  heading,
  layout = 'editorial',
}: Props) {
  const isFocused = layout === 'focused'

  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,hsl(var(--color-accent)/0.12),transparent_42%)]" />
      <div className="golden-guides pointer-events-none absolute inset-0 opacity-50" />
      <HomeUtilityMenu />
      <section className="relative mx-auto flex min-h-[100svh] w-full max-w-[var(--layout-content-max)] items-start px-[var(--layout-gutter)] pb-[var(--layout-gutter)] pt-[var(--layout-control-clearance)] lg:items-center lg:py-[var(--layout-control-clearance)]">
        <div
          className={`${isFocused ? 'mx-auto w-full max-w-[64rem]' : 'golden-panel-grid w-full'} overflow-hidden rounded-[var(--layout-panel-radius)] border border-border bg-background-overlay backdrop-blur-[2px]`}
          data-layout={isFocused ? 'focused-shell' : 'golden-shell'}
        >
          <header
            className={
              isFocused
                ? 'relative flex items-center gap-[1rem] border-b border-border px-[clamp(1rem,2.36vw,1.618rem)] py-[0.618rem] sm:gap-[1.618rem]'
                : 'relative border-b border-border p-[clamp(1rem,2.36vw,2.618rem)] xl:flex xl:flex-col xl:justify-center xl:border-b-0 xl:border-r'
            }
            data-layout-region={isFocused ? 'navigation' : 'supporting'}
          >
            <nav
              className={`${isFocused ? 'shrink-0' : 'mb-[1.618rem]'} text-sm text-foreground-muted`}
            >
              <Link
                href={backHref}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border px-4 transition-colors hover:border-foreground-muted hover:bg-background-overlay-strong hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[359px]:w-11 max-[359px]:px-0"
              >
                <BackIcon className="hidden h-4 w-4 max-[359px]:block" />
                <span className="max-[359px]:sr-only">{backLabel}</span>
              </Link>
            </nav>
            {isFocused ? (
              <span
                className="h-[1.618rem] w-px shrink-0 bg-border"
                aria-hidden="true"
              />
            ) : (
              <div
                className="mb-[0.618rem] flex items-center gap-[0.618rem]"
                aria-hidden="true"
              >
                <span className="h-px w-[2.618rem] bg-accent" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_1rem_hsl(var(--color-accent)/0.55)]" />
              </div>
            )}
            <h1
              id="tool-page-heading"
              className={`${isFocused ? 'text-[clamp(1.125rem,2vw,1.5rem)]' : 'text-[clamp(1.5rem,4vw,2.618rem)]'} min-w-0 font-semibold leading-[1.08] tracking-[-0.032em] text-foreground`}
            >
              {heading}
            </h1>
            {description ? (
              <p className="mt-[0.618rem] max-w-[38rem] text-sm leading-relaxed text-foreground-muted sm:text-base">
                {description}
              </p>
            ) : null}
          </header>
          <section
            aria-labelledby="tool-page-heading"
            className={`min-w-0 ${isFocused ? 'p-[clamp(1rem,2.36vw,2.236rem)]' : 'p-[clamp(1rem,2.36vw,2.618rem)]'}`}
            data-layout-region="primary"
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </section>
        </div>
      </section>
    </main>
  )
}
