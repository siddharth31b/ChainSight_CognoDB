import * as React from "react"
import cytoscape, { type Core } from "cytoscape"
import {
  Database,
  Maximize2,
  Network,
  RefreshCcw,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getGraphData,
  type GraphData,
  type GraphNode,
} from "@/lib/api"


const NODE_COLORS: Record<GraphNode["type"], string> = {
  Supplier: "#2563eb",
  Component: "#7c3aed",
  Product: "#059669",
  Factory: "#ea580c",
  Region: "#0891b2",
  RiskEvent: "#dc2626",
}


function formatPropertyName(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}


function formatPropertyValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—"
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return String(value)
}


export function GraphExplorer() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const cyRef = React.useRef<Core | null>(null)

  const [graphData, setGraphData] =
    React.useState<GraphData | null>(null)

  const [selectedNode, setSelectedNode] =
    React.useState<GraphNode | null>(null)

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)


  const loadGraph = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getGraphData()

      setGraphData(data)
      setSelectedNode(null)
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
    void loadGraph()
  }, [loadGraph])


  React.useEffect(() => {
    if (!containerRef.current || !graphData) {
      return
    }

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }


    const elements = [
      ...graphData.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.name,
          nodeType: node.type,
        },
      })),

      ...graphData.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          relationshipType: edge.type,
          label: edge.type,
        },
      })),
    ]


    const cy = cytoscape({
      container: containerRef.current,
      elements,

      minZoom: 0.25,
      maxZoom: 3,

      layout: {
        name: "cose",
        animate: false,
        fit: true,
        padding: 50,
        nodeRepulsion: () => 8500,
        idealEdgeLength: () => 100,
      },

      style: [
        {
  selector: "node",
  style: {
    label: "data(label)",
    width: 38,
    height: 38,
    "font-size": 9,
    "font-weight": 500,
    color: "#111827",
    "text-wrap": "wrap",
    "text-max-width": "100px",
    "text-valign": "bottom",
    "text-margin-y": 8,
    "background-color": "#64748b",
    "border-width": 2,
    "border-color": "#ffffff",
  },
},

        {
          selector: 'node[nodeType = "Supplier"]',
          style: {
            "background-color": NODE_COLORS.Supplier,
          },
        },

        {
          selector: 'node[nodeType = "Component"]',
          style: {
            "background-color": NODE_COLORS.Component,
          },
        },

        {
          selector: 'node[nodeType = "Product"]',
          style: {
            "background-color": NODE_COLORS.Product,
          },
        },

        {
          selector: 'node[nodeType = "Factory"]',
          style: {
            "background-color": NODE_COLORS.Factory,
          },
        },

        {
          selector: 'node[nodeType = "Region"]',
          style: {
            "background-color": NODE_COLORS.Region,
          },
        },

        {
          selector: 'node[nodeType = "RiskEvent"]',
          style: {
            "background-color": NODE_COLORS.RiskEvent,
            shape: "diamond",
          },
        },

        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#94a3b8",
            "target-arrow-color": "#94a3b8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 6,
            color: "#64748b",
            "text-rotation": "autorotate",
            "text-background-color": "#ffffff",
            "text-background-opacity": 0.8,
            "text-background-padding": "2px",
          },
        },

        {
          selector: 'edge[relationshipType = "DISRUPTS"]',
          style: {
            width: 2.5,
            "line-color": "#dc2626",
            "target-arrow-color": "#dc2626",
          },
        },

        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#111827",
          },
        },

        {
          selector: "edge:selected",
          style: {
            width: 3,
            "line-color": "#111827",
            "target-arrow-color": "#111827",
          },
        },
      ],
    })


    cy.on("tap", "node", (event) => {
      const nodeId = event.target.id()

      const originalNode = graphData.nodes.find(
        (node) => node.id === nodeId,
      )

      setSelectedNode(originalNode ?? null)
    })


    cy.on("tap", (event) => {
      if (event.target === cy) {
        setSelectedNode(null)
      }
    })


    cyRef.current = cy


    return () => {
      cy.destroy()

      if (cyRef.current === cy) {
        cyRef.current = null
      }
    }
  }, [graphData])


  const handleFitGraph = () => {
    cyRef.current?.fit(undefined, 50)
  }


  const handleResetLayout = () => {
    const cy = cyRef.current

    if (!cy) {
      return
    }

    cy.layout({
      name: "cose",
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
      nodeRepulsion: () => 8500,
      idealEdgeLength: () => 100,
    }).run()
  }


  if (loading) {
    return (
      <main
        id="graph-explorer-main"
        className="w-full flex-1 overflow-auto bg-background p-3 sm:p-4 md:p-6"
      >
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-[620px] animate-pulse rounded-xl border bg-muted/40" />
        </div>
      </main>
    )
  }


  if (error) {
    return (
      <main
        id="graph-explorer-main"
        className="w-full flex-1 overflow-auto bg-background p-3 sm:p-4 md:p-6"
      >
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-semibold text-destructive">
            Unable to load Graph Explorer
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void loadGraph()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      </main>
    )
  }


  if (!graphData || graphData.nodes.length === 0) {
    return (
      <main
        id="graph-explorer-main"
        className="w-full flex-1 overflow-auto bg-background p-3 sm:p-4 md:p-6"
      >
        <div className="rounded-xl border bg-card p-8 text-center">
          <Database className="mx-auto size-8 text-muted-foreground" />

          <h2 className="mt-3 font-semibold">
            No graph data available
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            CognoDB returned an empty graph.
          </p>
        </div>
      </main>
    )
  }


  return (
    <main
      id="graph-explorer-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Network className="size-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Supply Chain Graph Explorer
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Explore suppliers, components, products, factories,
              regions and risk events directly from CognoDB.
            </p>
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {graphData.node_count} Nodes
          </Badge>

          <Badge variant="secondary">
            {graphData.edge_count} Relationships
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFitGraph}
          >
            <Maximize2 className="mr-2 size-4" />
            Fit Graph
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
          >
            <RefreshCcw className="mr-2 size-4" />
            Reset Layout
          </Button>
        </div>
      </div>


      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div
            key={type}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: color }}
            />

            {type}
          </div>
        ))}
      </div>


      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div
            ref={containerRef}
            className="h-[620px] w-full bg-background"
          />
        </div>


        <aside className="rounded-xl border bg-card p-5">
          {selectedNode ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline">
                    {selectedNode.type}
                  </Badge>

                  <h3 className="mt-3 text-lg font-semibold">
                    {selectedNode.name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedNode.id}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    setSelectedNode(null)
                    cyRef.current?.elements().unselect()
                  }}
                  aria-label="Close node details"
                >
                  <X className="size-4" />
                </Button>
              </div>


              <div className="mt-5 space-y-3">
                {Object.entries(selectedNode.properties).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 border-b pb-3 last:border-0"
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatPropertyName(key)}
                      </span>

                      <span className="max-w-[160px] text-right text-xs font-medium">
                        {formatPropertyValue(value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
              <Network className="size-8 text-muted-foreground" />

              <h3 className="mt-3 font-medium">
                Select a node
              </h3>

              <p className="mt-1 max-w-[220px] text-sm text-muted-foreground">
                Click any graph node to inspect its CognoDB
                properties.
              </p>
            </div>
          )}
        </aside>
      </div>


      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium">
          Relationship flow
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          RiskEvent → DISRUPTS → Supplier / Factory · Supplier →
          SUPPLIES → Component → USED_IN → Product →
          MANUFACTURED_AT → Factory → SHIPS_TO → Region
        </p>
      </div>
    </main>
  )
}