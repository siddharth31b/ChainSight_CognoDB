import * as React from "react"
import {
  Boxes,
  Factory,
  Package,
  RefreshCcw,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getGraphData,
  type GraphData,
  type GraphNode,
} from "@/lib/api"


type EntityKind = "Product" | "Component" | "Factory"


type EntityPageConfig = {
  kind: EntityKind
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}


const PAGE_CONFIG: Record<EntityKind, EntityPageConfig> = {
  Product: {
    kind: "Product",
    title: "Products",
    description:
      "Browse products stored in the CognoDB supply-chain graph and inspect their graph-backed properties.",
    icon: Package,
  },
  Component: {
    kind: "Component",
    title: "Components",
    description:
      "Review component criticality, category, lead time, and unit cost from the live supply-chain graph.",
    icon: Boxes,
  },
  Factory: {
    kind: "Factory",
    title: "Factories",
    description:
      "Explore manufacturing facilities, countries, and monthly capacity stored in CognoDB.",
    icon: Factory,
  },
}


function asString(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  return String(value)
}


function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0)
}


function formatNumber(value: unknown) {
  const number = asNumber(value)

  if (!Number.isFinite(number)) {
    return "—"
  }

  return new Intl.NumberFormat("en-US").format(number)
}


function getEntityId(node: GraphNode) {
  return node.id
}


function EntityCards({
  kind,
  nodes,
}: {
  kind: EntityKind
  nodes: GraphNode[]
}) {
  if (kind === "Product") {
    const active = nodes.filter(
      (node) => node.properties.launch_status === "Active",
    ).length

    const pilot = nodes.filter(
      (node) => node.properties.launch_status === "Pilot",
    ).length

    const categories = new Set(
      nodes
        .map((node) => node.properties.category)
        .filter(Boolean)
        .map(String),
    ).size

    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Products" value={nodes.length} />
        <MetricCard label="Active Products" value={active} />
        <MetricCard label="Pilot Products" value={pilot} />
        <MetricCard label="Categories" value={categories} />
      </section>
    )
  }

  if (kind === "Component") {
    const critical = nodes.filter(
      (node) => node.properties.criticality === "Critical",
    ).length

    const high = nodes.filter(
      (node) => node.properties.criticality === "High",
    ).length

    const avgLeadTime =
      nodes.length > 0
        ? nodes.reduce(
            (sum, node) =>
              sum + asNumber(node.properties.lead_time_days),
            0,
          ) / nodes.length
        : 0

    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Components" value={nodes.length} />
        <MetricCard label="Critical" value={critical} />
        <MetricCard label="High Priority" value={high} />
        <MetricCard
          label="Avg. Lead Time"
          value={`${avgLeadTime.toFixed(1)} days`}
        />
      </section>
    )
  }

  const totalCapacity = nodes.reduce(
    (sum, node) =>
      sum + asNumber(node.properties.capacity_per_month),
    0,
  )

  const countries = new Set(
    nodes
      .map((node) => node.properties.country)
      .filter(Boolean)
      .map(String),
  ).size

  const averageCapacity =
    nodes.length > 0 ? totalCapacity / nodes.length : 0

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total Factories" value={nodes.length} />
      <MetricCard label="Countries" value={countries} />
      <MetricCard
        label="Monthly Capacity"
        value={formatNumber(totalCapacity)}
      />
      <MetricCard
        label="Avg. Capacity"
        value={formatNumber(Math.round(averageCapacity))}
      />
    </section>
  )
}


function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  )
}


function ProductRows({ nodes }: { nodes: GraphNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <tr key={node.id} className="border-b last:border-0">
          <td className="px-3 py-4">
            <p className="font-medium">{node.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getEntityId(node)}
            </p>
          </td>
          <td className="px-3 py-4">
            {asString(node.properties.category)}
          </td>
          <td className="px-3 py-4">
            <Badge variant="outline">
              {asString(node.properties.launch_status)}
            </Badge>
          </td>
        </tr>
      ))}
    </>
  )
}


function ComponentRows({ nodes }: { nodes: GraphNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <tr key={node.id} className="border-b last:border-0">
          <td className="px-3 py-4">
            <p className="font-medium">{node.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getEntityId(node)}
            </p>
          </td>
          <td className="px-3 py-4">
            {asString(node.properties.category)}
          </td>
          <td className="px-3 py-4">
            <Badge
              variant={
                node.properties.criticality === "Critical"
                  ? "destructive"
                  : "outline"
              }
            >
              {asString(node.properties.criticality)}
            </Badge>
          </td>
          <td className="px-3 py-4">
            {formatNumber(node.properties.lead_time_days)} days
          </td>
          <td className="px-3 py-4">
            ${formatNumber(node.properties.unit_cost)}
          </td>
        </tr>
      ))}
    </>
  )
}


function FactoryRows({ nodes }: { nodes: GraphNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <tr key={node.id} className="border-b last:border-0">
          <td className="px-3 py-4">
            <p className="font-medium">{node.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getEntityId(node)}
            </p>
          </td>
          <td className="px-3 py-4">
            {asString(node.properties.country)}
          </td>
          <td className="px-3 py-4">
            {formatNumber(node.properties.capacity_per_month)}
          </td>
        </tr>
      ))}
    </>
  )
}


function EntityTable({
  kind,
  nodes,
}: {
  kind: EntityKind
  nodes: GraphNode[]
}) {
  if (kind === "Product") {
    return (
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="px-3 py-3 font-medium">Product</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Launch Status</th>
          </tr>
        </thead>
        <tbody>
          <ProductRows nodes={nodes} />
        </tbody>
      </table>
    )
  }

  if (kind === "Component") {
    return (
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="px-3 py-3 font-medium">Component</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Criticality</th>
            <th className="px-3 py-3 font-medium">Lead Time</th>
            <th className="px-3 py-3 font-medium">Unit Cost</th>
          </tr>
        </thead>
        <tbody>
          <ComponentRows nodes={nodes} />
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full min-w-[620px] border-collapse text-left text-sm">
      <thead>
        <tr className="border-b text-xs text-muted-foreground">
          <th className="px-3 py-3 font-medium">Factory</th>
          <th className="px-3 py-3 font-medium">Country</th>
          <th className="px-3 py-3 font-medium">
            Capacity / Month
          </th>
        </tr>
      </thead>
      <tbody>
        <FactoryRows nodes={nodes} />
      </tbody>
    </table>
  )
}


function EntityPage({ kind }: { kind: EntityKind }) {
  const config = PAGE_CONFIG[kind]
  const Icon = config.icon

  const [graphData, setGraphData] =
    React.useState<GraphData | null>(null)

  const [loading, setLoading] =
    React.useState(true)

  const [error, setError] =
    React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] =
    React.useState("")


  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getGraphData()
      setGraphData(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load graph data.",
      )
    } finally {
      setLoading(false)
    }
  }, [])


  React.useEffect(() => {
    void loadData()
  }, [loadData])


  const nodes = React.useMemo(() => {
    if (!graphData) {
      return []
    }

    const query = searchTerm.trim().toLowerCase()

    return graphData.nodes
      .filter((node) => node.type === kind)
      .filter((node) => {
        if (!query) {
          return true
        }

        return (
          node.name.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query) ||
          Object.values(node.properties).some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
          )
        )
      })
  }, [graphData, kind, searchTerm])


  const allNodes = React.useMemo(() => {
    if (!graphData) {
      return []
    }

    return graphData.nodes.filter(
      (node) => node.type === kind,
    )
  }, [graphData, kind])


  return (
    <main
      id={`${kind.toLowerCase()}s-main`}
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {config.title}
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </section>


      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to load {config.title.toLowerCase()}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </section>
      ) : (
        <>
          <EntityCards kind={kind} nodes={allNodes} />

          <section className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  All {config.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live entities returned from the CognoDB graph.
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
                  placeholder={`Search ${config.title.toLowerCase()}...`}
                  className="pl-9"
                />
              </div>
            </div>

            {nodes.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No {config.title.toLowerCase()} match your search.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <EntityTable kind={kind} nodes={nodes} />
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}


export function ProductsPage() {
  return <EntityPage kind="Product" />
}


export function ComponentsPage() {
  return <EntityPage kind="Component" />
}


export function FactoriesPage() {
  return <EntityPage kind="Factory" />
}
