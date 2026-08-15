import * as React from "react"
import {
  AlertTriangle,
  Boxes,
  Building2,
  Factory,
  Globe2,
  Package,
  RefreshCcw,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getRiskEventImpact,
  getRiskEvents,
  type RiskEvent,
  type RiskEventImpact,
} from "@/lib/api"


function getSeverityVariant(
  severity: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "Critical") {
    return "destructive"
  }

  if (severity === "High") {
    return "default"
  }

  if (severity === "Medium") {
    return "secondary"
  }

  return "outline"
}


function getStatusClass(status: string) {
  switch (status) {
    case "Active":
      return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"

    case "Monitoring":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"

    case "Resolved":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"

    default:
      return "border-border bg-muted text-muted-foreground"
  }
}


function ImpactList({
  title,
  items,
  icon: Icon,
}: {
  title: string
  items: string[]
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />

        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <Badge
          variant="secondary"
          className="ml-auto"
        >
          {items.length}
        </Badge>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No affected entities found.
        </p>
      )}
    </div>
  )
}


export function RiskEventsPage() {
  const [events, setEvents] =
    React.useState<RiskEvent[]>([])

  const [selectedEventId, setSelectedEventId] =
    React.useState("")

  const [impact, setImpact] =
    React.useState<RiskEventImpact | null>(null)

  const [eventsLoading, setEventsLoading] =
    React.useState(true)

  const [impactLoading, setImpactLoading] =
    React.useState(false)

  const [error, setError] =
    React.useState<string | null>(null)


  const loadEvents = React.useCallback(async () => {
    try {
      setEventsLoading(true)
      setError(null)

      const data = await getRiskEvents()

      setEvents(data)

      if (data.length > 0) {
        setSelectedEventId((current) =>
          current || data[0].event_id
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load risk events.",
      )
    } finally {
      setEventsLoading(false)
    }
  }, [])


  React.useEffect(() => {
    void loadEvents()
  }, [loadEvents])


  const analyzeImpact = async () => {
    if (!selectedEventId) {
      return
    }

    try {
      setImpactLoading(true)
      setError(null)

      const data =
        await getRiskEventImpact(selectedEventId)

      setImpact(data)
    } catch (err) {
      setImpact(null)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze risk event impact.",
      )
    } finally {
      setImpactLoading(false)
    }
  }


  const selectedEvent = events.find(
    (event) =>
      event.event_id === selectedEventId,
  )


  if (eventsLoading) {
    return (
      <main
        id="risk-events-main"
        className="w-full flex-1 overflow-auto bg-background p-3 sm:p-4 md:p-6"
      >
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl border bg-muted/40" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-xl border bg-muted/40"
                />
              ),
            )}
          </div>
        </div>
      </main>
    )
  }


  return (
    <main
      id="risk-events-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />

              <h2 className="text-lg font-semibold">
                Risk Event Impact Analysis
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Select a risk event and trace its cascading
              impact across the CognoDB supply-chain graph.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadEvents()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh Events
          </Button>
        </div>


        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <label
              htmlFor="risk-event-select"
              className="mb-2 block text-xs font-medium text-muted-foreground"
            >
              Risk Event
            </label>

            <select
              id="risk-event-select"
              value={selectedEventId}
              onChange={(event) => {
                setSelectedEventId(
                  event.target.value,
                )

                setImpact(null)
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {events.map((event) => (
                <option
                  key={event.event_id}
                  value={event.event_id}
                >
                  {event.event_id} — {event.name}
                </option>
              ))}
            </select>
          </div>


          <Button
            className="self-end"
            disabled={
              !selectedEventId ||
              impactLoading
            }
            onClick={() => void analyzeImpact()}
          >
            {impactLoading
              ? "Analyzing..."
              : "Analyze Impact"}
          </Button>
        </div>


        {selectedEvent && !impact && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={getSeverityVariant(
                selectedEvent.severity,
              )}
            >
              {selectedEvent.severity}
            </Badge>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                selectedEvent.status,
              )}`}
            >
              {selectedEvent.status}
            </span>

            <Badge variant="outline">
              {selectedEvent.event_type}
            </Badge>
          </div>
        )}
      </div>


      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to complete request
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      )}


      {!impact && !error && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <AlertTriangle className="mx-auto size-9 text-muted-foreground" />

          <h3 className="mt-3 font-medium">
            Select and analyze a risk event
          </h3>

          <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">
            ChainSight will traverse the graph to
            identify downstream components, products,
            factories and regions.
          </p>
        </div>
      )}


      {impact && (
        <>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={getSeverityVariant(
                      impact.severity,
                    )}
                  >
                    {impact.severity}
                  </Badge>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                      impact.status,
                    )}`}
                  >
                    {impact.status}
                  </span>

                  <Badge variant="outline">
                    Impact: {impact.impact_level}
                  </Badge>
                </div>

                <h2 className="mt-3 text-xl font-semibold">
                  {impact.event_name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {impact.event_id}
                </p>
              </div>


              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Directly disrupted
                </p>

                <p className="mt-1 font-medium">
                  {impact.disrupted_entity_name}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {impact.disrupted_entity_type} ·{" "}
                  {impact.disrupted_entity_id}
                </p>
              </div>
            </div>
          </div>


          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-card p-5">
              <Boxes className="size-5 text-muted-foreground" />

              <p className="mt-4 text-2xl font-semibold">
                {impact.affected_components.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Components
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <Package className="size-5 text-muted-foreground" />

              <p className="mt-4 text-2xl font-semibold">
                {impact.affected_products.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Products
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <Factory className="size-5 text-muted-foreground" />

              <p className="mt-4 text-2xl font-semibold">
                {impact.affected_factories.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Factories
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <Globe2 className="size-5 text-muted-foreground" />

              <p className="mt-4 text-2xl font-semibold">
                {impact.affected_regions.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Regions
              </p>
            </div>
          </div>


          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <h3 className="text-sm font-medium">
              Cascading Graph Path
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Live multi-hop impact traversal from CognoDB
            </p>

            <div className="mt-6 flex min-w-[900px] items-center gap-3">
              <div className="w-44 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-[10px] font-medium uppercase text-red-500">
                  Risk Event
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {impact.event_name}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-medium text-red-500">
                  DISRUPTS
                </p>
                <p className="text-lg">→</p>
              </div>

              <div className="w-44 rounded-xl border bg-muted/20 p-4">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  {impact.disrupted_entity_type}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {impact.disrupted_entity_name}
                </p>
              </div>

              <div className="text-lg">→</div>

              <div className="w-36 rounded-xl border bg-card p-4 text-center">
                <Boxes className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-2 font-semibold">
                  {impact.affected_components.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Components
                </p>
              </div>

              <div className="text-lg">→</div>

              <div className="w-36 rounded-xl border bg-card p-4 text-center">
                <Package className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-2 font-semibold">
                  {impact.affected_products.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Products
                </p>
              </div>

              <div className="text-lg">→</div>

              <div className="w-36 rounded-xl border bg-card p-4 text-center">
                <Building2 className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-2 font-semibold">
                  {impact.affected_factories.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Factories
                </p>
              </div>

              <div className="text-lg">→</div>

              <div className="w-36 rounded-xl border bg-card p-4 text-center">
                <Globe2 className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-2 font-semibold">
                  {impact.affected_regions.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  Regions
                </p>
              </div>
            </div>
          </div>


          <div className="grid gap-4 md:grid-cols-2">
            <ImpactList
              title="Affected Components"
              items={impact.affected_components}
              icon={Boxes}
            />

            <ImpactList
              title="Affected Products"
              items={impact.affected_products}
              icon={Package}
            />

            <ImpactList
              title="Affected Factories"
              items={impact.affected_factories}
              icon={Factory}
            />

            <ImpactList
              title="Affected Regions"
              items={impact.affected_regions}
              icon={Globe2}
            />
          </div>


          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              Why this is a graph query
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              A disruption is not limited to one table or
              entity. ChainSight follows connected nodes and
              relationships to calculate downstream impact
              across the supply network.
            </p>
          </div>
        </>
      )}
    </main>
  )
}