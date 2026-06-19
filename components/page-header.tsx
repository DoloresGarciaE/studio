import * as React from "react"

export function PageHeader({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  const slot = action ?? children
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-background px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {slot ? <div className="flex items-center gap-2">{slot}</div> : null}
    </div>
  )
}
