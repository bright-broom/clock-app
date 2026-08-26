'use client'

import { useTranslations } from 'next-intl'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type ErrorBoundaryInnerProps = {
  children: ReactNode
  fallback?: ReactNode
  logPrefix?: string
  errorMessage: string
  retryText: string
}

type State = {
  hasError: boolean
}

class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, State> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const prefix = this.props.logPrefix ?? 'ErrorBoundary error:'
    console.error(prefix, error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="text-center text-foreground-muted">
            <p>{this.props.errorMessage}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 min-h-[44px] rounded border border-border px-4 py-2 transition-colors hover:bg-background-overlay"
            >
              {this.props.retryText}
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  logPrefix?: string
}

export function ErrorBoundary({
  children,
  fallback,
  logPrefix,
}: ErrorBoundaryProps) {
  const t = useTranslations('error')

  const innerProps: ErrorBoundaryInnerProps = {
    children,
    errorMessage: t('featureError'),
    retryText: t('retry'),
  }

  if (fallback !== undefined) {
    innerProps.fallback = fallback
  }

  if (logPrefix !== undefined) {
    innerProps.logPrefix = logPrefix
  }

  return <ErrorBoundaryInner {...innerProps} />
}
