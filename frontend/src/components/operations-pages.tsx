import * as React from "react"
import {
  AlertTriangle,
  Boxes,
  Globe2,
  RefreshCcw,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getGraphData,
  getRiskEvents,
  type GraphNode,
  type RiskEvent,
} from "@/lib/api"


function formatNumber(value: unknown) {
  const numeric = Number(value ?? 0)

  if (!Number.isFinite(numeric)) {
    return "—"
  }

  return new Intl.NumberFormat("en-US").format(numeric)
}


function statusClass(status: string) {
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


export function RegionsPage() {
  const [regions, setRegions] = React.useState<GraphNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  const loadRegions = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getGraphData()

      setRegions(
        data.nodes.filter((node) => node.type === "Region"),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load regions.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadRegions()
  }, [loadRegions])

  const filteredRegions = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return regions.filter((region) => {
      if (!query) return true

      return (
        region.name.toLowerCase().includes(query) ||
        region.id.toLowerCase().includes(query) ||
        String(region.properties.market_priority ?? "")
          .toLowerCase()
          .includes(query)
      )
    })
  }, [regions, searchTerm])

  const highPriorityCount = regions.filter((region) => {
    const priority = region.properties.market_priority

    return priority === "High" || priority === "Critical"
  }).length

  return (
    <main
      id="regions-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Globe2 className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">Regions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Destination markets connected to factories through SHIPS_TO relationships.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void loadRegions()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to load regions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Regions
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {regions.length}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                High Priority Markets
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {highPriorityCount}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Relationship
              </p>
              <p className="mt-3 text-lg font-semibold">
                Factory → SHIPS_TO → Region
              </p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">All Regions</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live Region nodes returned from CognoDB.
                </p>
              </div>

              <div className="relative w-full sm:w-[280px]">
                <Search
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search regions..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredRegions.map((region) => (
                <div
                  key={region.id}
                  className="rounded-xl border bg-background/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{region.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {region.id}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {String(
                        region.properties.market_priority ?? "—",
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}


export function AlertsPage() {
  const [events, setEvents] = React.useState<RiskEvent[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadAlerts = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getRiskEvents()

      setEvents(
        data.filter((event) => event.status !== "Resolved"),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load alerts.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadAlerts()
  }, [loadAlerts])

  const active = events.filter(
    (event) => event.status === "Active",
  ).length

  const monitoring = events.filter(
    (event) => event.status === "Monitoring",
  ).length

  return (
    <main
      id="alerts-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <AlertTriangle className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Supply Chain Alerts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Active and monitored risk events that may affect the supply network.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void loadAlerts()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </section>

      {loading ? (
        <section className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to load alerts
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Open Alerts
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {events.length}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Active
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {active}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Monitoring
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {monitoring}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="rounded-xl border bg-card p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          event.severity === "Critical"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {event.severity}
                      </Badge>

                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(
                          event.status,
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold">
                      {event.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.event_id} · {event.event_type}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.hash = "#risk-events"
                    }}
                  >
                    Analyze Impact
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  )
}


export function CriticalComponentsPage() {
  const [components, setComponents] = React.useState<GraphNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadCriticalComponents = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getGraphData()

      setComponents(
        data.nodes.filter(
          (node) =>
            node.type === "Component" &&
            node.properties.criticality === "Critical",
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load critical components.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadCriticalComponents()
  }, [loadCriticalComponents])

  return (
    <main
      id="critical-components-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <Boxes className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Critical Components
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Components marked Critical in the CognoDB supply-chain graph.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void loadCriticalComponents()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to load critical components
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Critical Components
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {components.length}
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Avg. Lead Time
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {components.length
                  ? (
                    components.reduce(
                      (sum, component) =>
                        sum +
                        Number(
                          component.properties.lead_time_days ??
                          0,
                        ),
                      0,
                    ) / components.length
                  ).toFixed(1)
                  : "0"}{" "}
                days
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total Unit Cost
              </p>
              <p className="mt-3 text-2xl font-semibold">
                $
                {formatNumber(
                  components.reduce(
                    (sum, component) =>
                      sum +
                      Number(
                        component.properties.unit_cost ?? 0,
                      ),
                    0,
                  ),
                )}
              </p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {components.map((component) => (
              <div
                key={component.id}
                className="rounded-xl border border-red-500/20 bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="destructive">Critical</Badge>
                    <h3 className="mt-3 font-semibold">
                      {component.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {component.id}
                    </p>
                  </div>

                  <Boxes className="size-5 text-red-500" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Category
                    </p>
                    <p className="mt-1 font-medium">
                      {String(
                        component.properties.category ?? "—",
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Lead Time
                    </p>
                    <p className="mt-1 font-medium">
                      {formatNumber(
                        component.properties.lead_time_days,
                      )}{" "}
                      days
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Unit Cost
                    </p>
                    <p className="mt-1 font-medium">
                      $
                      {formatNumber(
                        component.properties.unit_cost,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
