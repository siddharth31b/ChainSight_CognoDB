"use client";

import {
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Package,
  RotateCcw,
  Search,
  Settings,
  Truck,
  User,
  Users,
} from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ComponentsPage,
  FactoriesPage,
  ProductsPage,
} from "@/components/catalog-pages";
import {
  AlertsPage,
  CriticalComponentsPage,
  RegionsPage,
} from "@/components/operations-pages";
import { GraphExplorer } from "@/components/graph-explorer";
import { RiskEventsPage } from "@/components/risk-events-page";
import { cn } from "@/lib/utils";
import {
  getDashboardSummary,
  getRiskEvents,
  getSupplierImpact,
  getSuppliers,
  type DashboardSummary,
  type RiskEvent,
  type Supplier,
  type SupplierImpact,
} from "@/lib/api";

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

type SidebarData = {
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  navGroups: NavGroup[];
  footerGroup: NavGroup;
  user?: UserData;
};

type ViewId = "dashboard" | "risk-events" | "products" | "components" | "factories" | "suppliers" | "impact-analysis" | "graph-explorer" | "regions" | "alerts" | "critical-components";

type StatGridItem = {
  label: string;
  value: number;
  format: "currency" | "number" | "percent" | "days" | "compact";
  change: number;
  invertColor: boolean;
};


const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const numberFormatter = new Intl.NumberFormat("en-US");
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
});
const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const formatStatValue = (stat: StatGridItem) => {
  switch (stat.format) {
    case "currency":
      return currencyFormatter.format(stat.value);
    case "percent":
      return percentFormatter.format(stat.value);
    case "days":
      return `${oneDecimalFormatter.format(stat.value)} days`;
    case "compact":
      return compactNumberFormatter.format(stat.value);
    default:
      return numberFormatter.format(stat.value);
  }
};

const mixBase = "var(--background)";

const palette = {
  primary: "var(--primary)",
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
  tertiary: {
    light: `color-mix(in oklch, var(--primary) 55%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 65%, ${mixBase})`,
  },
  quaternary: {
    light: `color-mix(in oklch, var(--primary) 40%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 45%, ${mixBase})`,
  },
};

const riskEventChartConfig = {
  count: { label: "Risk Events", color: palette.primary },
} satisfies ChartConfig;

const sidebarData: SidebarData = {
  logo: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "ChainSight",
    title: "ChainSight",
    description: "Supply Chain Intelligence",
  },
  navGroups: [
    {
      title: "Main",
      defaultOpen: true,
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "#dashboard-main",
          isActive: true,
        },
        { label: "Risk Events", icon: ClipboardList, href: "#risk-events" },
        {
          label: "Products",
          icon: Box,
          href: "#",
          children: [
            { label: "All Products", icon: Package, href: "#products" },
            { label: "Components", icon: Package, href: "#components" },
            { label: "Factories", icon: Package, href: "#factories" },
          ],
        },
        { label: "Suppliers", icon: Users, href: "#suppliers" },
      ],
    },
    {
      title: "Impact Analysis",
      defaultOpen: true,
      items: [
        { label: "Impact Analysis", icon: BarChart3, href: "#impact-analysis" },
        { label: "Graph Explorer", icon: Globe, href: "#graph-explorer" },
      ],
    },
    {
      title: "Other",
      defaultOpen: false,
      items: [
        { label: "Regions", icon: Truck, href: "#regions" },
        { label: "Alerts", icon: MessageSquare, href: "#alerts" },
        { label: "Critical Components", icon: RotateCcw, href: "#critical-components" },
      ],
    },
  ],
  footerGroup: {
    title: "Settings",
    items: [{ label: "Settings", icon: Settings, href: "#" }],
  },
  user: {
    name: "Supply Chain Analyst",
    email: "demo@chainsight.app",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
  },
};

const createStatsGridData = (
  summary: DashboardSummary,
): StatGridItem[] => [
    {
      label: "Suppliers",
      value: summary.total_suppliers,
      format: "number",
      change: 0,
      invertColor: false,
    },
    {
      label: "Components",
      value: summary.total_components,
      format: "number",
      change: 0,
      invertColor: false,
    },
    {
      label: "Products",
      value: summary.total_products,
      format: "number",
      change: 0,
      invertColor: false,
    },
    {
      label: "Risk Events",
      value: summary.total_risk_events,
      format: "number",
      change: 0,
      invertColor: false,
    },
    {
      label: "Critical Components",
      value: summary.critical_components,
      format: "number",
      change: 0,
      invertColor: false,
    },
    {
      label: "Avg. Reliability",
      value: summary.average_supplier_reliability / 100,
      format: "percent",
      change: 0,
      invertColor: false,
    },
  ];

const supplierReliabilityChartConfig = {
  reliability: { label: "Reliability", color: palette.primary },
} satisfies ChartConfig;

const SidebarLogo = ({ logo }: { logo: SidebarData["logo"] }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip={logo.title}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src={logo.src}
              alt={logo.alt}
              width={24}
              height={24}
              className="size-6 text-primary-foreground invert dark:invert-0"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{logo.title}</span>
            <span className="text-xs text-muted-foreground">
              {logo.description}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NavMenuItem = ({
  item,
  activeView,
}: {
  item: NavItem;
  activeView: ViewId;
}) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const isCatalogView =
    activeView === "products" ||
    activeView === "components" ||
    activeView === "factories";

  const isActive =
    (item.href === "#dashboard-main" && activeView === "dashboard") ||
    (item.href === "#risk-events" && activeView === "risk-events") ||
    (item.label === "Products" && isCatalogView) ||
    (item.href === "#suppliers" && activeView === "suppliers") ||
    (item.href === "#impact-analysis" && activeView === "impact-analysis") ||
    (item.href === "#graph-explorer" && activeView === "graph-explorer") ||
    (item.href === "#regions" && activeView === "regions") ||
    (item.href === "#alerts" && activeView === "alerts") ||
    (item.href === "#critical-components" &&
      activeView === "critical-components") ||
    (item.href !== "#dashboard-main" &&
      item.href !== "#risk-events" &&
      item.href !== "#suppliers" &&
      item.href !== "#impact-analysis" &&
      item.href !== "#graph-explorer" &&
      item.href !== "#regions" &&
      item.href !== "#alerts" &&
      item.href !== "#critical-components" &&
      item.isActive);

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={Boolean(isActive)}
          tooltip={item.label}
          render={<a href={item.href} />}
        >
          <Icon className="size-4" aria-hidden="true" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            isActive={Boolean(isActive)}
            tooltip={item.label}
          />
        }
      >
        <Icon className="size-4" aria-hidden="true" />
        <span>{item.label}</span>
        <ChevronRight
          className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.label}>
              <SidebarMenuSubButton
                isActive={
                  (child.href === "#products" && activeView === "products") ||
                  (child.href === "#components" && activeView === "components") ||
                  (child.href === "#factories" && activeView === "factories") ||
                  child.isActive
                }
                render={<a href={child.href} />}
              >
                {child.label}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

const NavUser = ({ user }: { user: UserData }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" />}><Avatar className="size-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar><div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div><ChevronsUpDown className="ml-auto size-4" aria-hidden="true" /></DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" aria-hidden="true" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const AppSidebar = ({
  activeView,
  ...props
}: React.ComponentProps<typeof Sidebar> & { activeView: ViewId }) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <SidebarLogo logo={sidebarData.logo} />
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavMenuItem key={item.label} item={item} activeView={activeView} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {sidebarData.user && <NavUser user={sidebarData.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const DashboardHeader = ({ activeView }: { activeView: ViewId }) => {
  const headerConfig = {
    dashboard: {
      title: "Dashboard",
      icon: LayoutDashboard,
    },
    "risk-events": {
      title: "Risk Events",
      icon: ClipboardList,
    },
    products: {
      title: "Products",
      icon: Package,
    },
    components: {
      title: "Components",
      icon: Box,
    },
    factories: {
      title: "Factories",
      icon: Truck,
    },
    suppliers: {
      title: "Suppliers",
      icon: Users,
    },
    "impact-analysis": {
      title: "Impact Analysis",
      icon: BarChart3,
    },
    "graph-explorer": {
      title: "Graph Explorer",
      icon: Globe,
    },
    regions: {
      title: "Regions",
      icon: Truck,
    },
    alerts: {
      title: "Alerts",
      icon: MessageSquare,
    },
    "critical-components": {
      title: "Critical Components",
      icon: RotateCcw,
    },
  } satisfies Record<
    ViewId,
    {
      title: string;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }
  >;

  const HeaderIcon = headerConfig[activeView].icon;

  return (
    <header className="flex w-full items-center gap-3 border-b bg-background px-4 py-4 sm:px-6">
      <HeaderIcon className="size-5" aria-hidden="true" />
      <h1 className="text-base font-medium text-pretty">
        {headerConfig[activeView].title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative w-full max-w-[220px] sm:max-w-[260px]">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="header-search"
            inputMode="search"
            autoComplete="off"
            aria-label="Search supply chain dashboard"
            placeholder="Search suppliers, products…"
            className="h-9 w-full pr-14 pl-9 text-sm"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            {"\u2318"}
            {"\u00a0"}K
          </kbd>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          aria-label="Notifications"
        >
          <Bell className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          aria-label="Help"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
};

const RiskEventOverview = () => {
  const [events, setEvents] = React.useState<RiskEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadRiskEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getRiskEvents();

        if (!cancelled) {
          setEvents(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load risk events.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRiskEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[360px] min-w-0 flex-1 animate-pulse flex-col rounded-xl border bg-card p-6">
        <div className="h-7 w-36 rounded bg-muted" />
        <div className="mt-2 h-4 w-52 rounded bg-muted" />
        <div className="mt-8 flex flex-1 items-end gap-6 px-6 pb-4">
          {[45, 70, 70, 20].map((height, index) => (
            <div key={index} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t bg-muted"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[360px] min-w-0 flex-1 flex-col justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">
          Unable to load risk events
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Make sure the FastAPI backend and CognoDB instance are running.
        </p>
      </div>
    );
  }

  const severityOrder = ["Critical", "High", "Medium", "Low"];
  const chartData = severityOrder.map((severity) => ({
    severity,
    count: events.filter((event) => event.severity === severity).length,
  }));

  const activeCount = events.filter((event) => event.status === "Active").length;
  const monitoringCount = events.filter(
    (event) => event.status === "Monitoring",
  ).length;
  const resolvedCount = events.filter(
    (event) => event.status === "Resolved",
  ).length;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border bg-card p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
            {events.length} Risk Events
          </p>
          <p className="text-xs text-muted-foreground">
            Live risk exposure by severity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground sm:text-xs">
          <span>Active: {activeCount}</span>
          <span>Monitoring: {monitoringCount}</span>
          <span>Resolved: {resolvedCount}</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No risk events found in CognoDB.
          </p>
        </div>
      ) : (
        <div className="h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[280px]">
          <ChartContainer config={riskEventChartConfig} className="h-full w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="severity"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                cursor={{ fillOpacity: 0.05, radius: 4 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                      <p className="text-xs font-medium text-foreground">
                        {label} severity
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {numberFormatter.format(Number(payload[0]?.value ?? 0))} risk event(s)
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

const StatsCardsGrid = () => {
  const [summary, setSummary] =
    React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadDashboardSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardSummary();

        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboardSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[122px] animate-pulse flex-col rounded-xl border bg-card p-4 sm:p-5"
          >
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-5 h-6 w-16 rounded bg-muted" />
            <div className="mt-3 h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[260px] xl:w-[420px]">
        <div className="flex w-full flex-col justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-medium text-destructive">
            Unable to load ChainSight data
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Make sure the FastAPI backend and CognoDB instance are running.
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[260px] xl:w-[420px]">
        <div className="flex w-full items-center justify-center rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            No dashboard data available.
          </p>
        </div>
      </div>
    );
  }

  const statsGridData = createStatsGridData(summary);

  const getStatDescription = (label: string) => {
    switch (label) {
      case "Suppliers":
        return `${summary.total_factories} factories connected`;
      case "Components":
        return `${summary.critical_components} critical components`;
      case "Products":
        return `${summary.total_regions} destination regions`;
      case "Risk Events":
        return `${summary.active_risk_events} currently active`;
      case "Critical Components":
        return "High-priority supply risk";
      case "Avg. Reliability":
        return "Across all suppliers";
      default:
        return "Live from CognoDB";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-2">
      {statsGridData.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col rounded-xl border bg-card p-4 sm:p-5"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-2 size-6 text-muted-foreground"
              aria-label={`More options for ${stat.label}`}
            >
              <MoreHorizontal className="size-3.5" aria-hidden="true" />
            </Button>
          </div>

          <span className="mt-3 text-lg font-semibold tracking-tight sm:text-xl">
            {formatStatValue(stat)}
          </span>

          <div className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
            {getStatDescription(stat.label)}
          </div>
        </div>
      ))}
    </div>
  );
};

const SupplierReliabilityChart = () => {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load supplier data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const chartData = suppliers.map((supplier) => ({
    supplierId: supplier.supplier_id,
    supplierName: supplier.name,
    reliability: supplier.reliability_score,
  }));

  const averageReliability = suppliers.length
    ? suppliers.reduce((sum, supplier) => sum + supplier.reliability_score, 0) /
    suppliers.length
    : 0;

  return (
    <div
      id="supplier-reliability"
      className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-pretty">
            Supplier Reliability
          </h2>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {loading ? "—" : `${averageReliability.toFixed(1)}%`}
            </span>
            <span className="pb-0.5 text-xs text-muted-foreground">
              network average
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reliability score for every supplier in CognoDB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Refresh suppliers"
          onClick={() => void loadSuppliers()}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[280px] items-end gap-3 rounded-lg border border-dashed p-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 animate-pulse rounded-t bg-muted"
              style={{ height: `${45 + (index % 5) * 9}%` }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <div>
            <p className="font-medium text-destructive">
              Unable to load suppliers
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No suppliers available.</p>
        </div>
      ) : (
        <div className="h-[280px] w-full min-w-0">
          <ChartContainer
            config={supplierReliabilityChartConfig}
            className="h-full w-full"
          >
            <BarChart data={chartData} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="supplierId"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
                width={38}
              />
              <Tooltip
                cursor={{ fillOpacity: 0.04 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload as
                    | {
                      supplierId: string;
                      supplierName: string;
                      reliability: number;
                    }
                    | undefined;

                  if (!row) return null;

                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                      <p className="text-xs font-medium text-foreground">
                        {row.supplierName}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {row.supplierId}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {row.reliability.toFixed(1)}% reliability
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="reliability"
                fill="var(--color-reliability)"
                radius={[4, 4, 0, 0]}
                maxBarSize={34}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

const RiskEventsPanel = () => {
  const [events, setEvents] = React.useState<RiskEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadRiskEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRiskEvents();
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load risk events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRiskEvents();
  }, [loadRiskEvents]);

  const statusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-destructive/10 text-destructive";
      case "monitoring":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div
      id="risk-events-panel"
      className="flex flex-col gap-4 rounded-xl border bg-card p-5 xl:w-[420px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-pretty">Risk Event Feed</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live events stored in the supply-chain graph
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Refresh risk events"
          onClick={() => void loadRiskEvents()}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-center">
          <div>
            <p className="font-medium text-destructive">
              Unable to load risk events
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No risk events available.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[280px]">
          <div className="space-y-2 pr-3">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="rounded-lg border bg-background/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {event.name}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {event.event_id} · {event.event_type}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      statusClass(event.status),
                    )}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Severity</span>
                  <span className="font-medium text-foreground">
                    {event.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const SuppliersContent = () => {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState<"all" | "1" | "2">("all");
  const [selectedSupplierId, setSelectedSupplierId] = React.useState("");
  const [impact, setImpact] = React.useState<SupplierImpact | null>(null);
  const [impactLoading, setImpactLoading] = React.useState(false);
  const [impactError, setImpactError] = React.useState<string | null>(null);

  const loadSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSuppliers();
      setSuppliers(data);

      if (data.length > 0) {
        setSelectedSupplierId((current) => current || data[0].supplier_id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load suppliers.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const filteredSuppliers = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.supplier_id.toLowerCase().includes(query) ||
        supplier.country.toLowerCase().includes(query);

      const matchesTier =
        tierFilter === "all" || supplier.tier === Number(tierFilter);

      return matchesSearch && matchesTier;
    });
  }, [searchTerm, suppliers, tierFilter]);

  const averageReliability = suppliers.length
    ? suppliers.reduce(
      (sum, supplier) => sum + supplier.reliability_score,
      0,
    ) / suppliers.length
    : 0;

  const tierOneCount = suppliers.filter(
    (supplier) => supplier.tier === 1,
  ).length;

  const attentionCount = suppliers.filter(
    (supplier) => supplier.reliability_score < 90,
  ).length;

  const selectedSupplier = suppliers.find(
    (supplier) => supplier.supplier_id === selectedSupplierId,
  );

  const viewImpact = async (supplierId: string) => {
    try {
      setSelectedSupplierId(supplierId);
      setImpactLoading(true);
      setImpactError(null);

      const data = await getSupplierImpact(supplierId);
      setImpact(data);
    } catch (err) {
      setImpact(null);
      setImpactError(
        err instanceof Error
          ? err.message
          : "Unable to load supplier impact.",
      );
    } finally {
      setImpactLoading(false);
    }
  };

  return (
    <main
      id="suppliers-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5" aria-hidden="true" />
              <h2 className="text-xl font-semibold tracking-tight">
                Supplier Network
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review supplier reliability, tier, location, and downstream
              supply-chain impact using live CognoDB data.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadSuppliers()}
            disabled={loading}
          >
            <RotateCcw className="mr-2 size-4" aria-hidden="true" />
            Refresh Suppliers
          </Button>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border bg-card p-5"
            >
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-5 h-7 w-16 rounded bg-muted" />
            </div>
          ))}
        </section>
      ) : error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">
            Unable to load suppliers
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
              <p className="mt-3 text-2xl font-semibold">
                {suppliers.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Connected supplier nodes
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Tier 1 Suppliers</p>
              <p className="mt-3 text-2xl font-semibold">
                {tierOneCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Primary supply partners
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Avg. Reliability
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {averageReliability.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Network supplier average
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Needs Attention
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {attentionCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reliability below 90%
              </p>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-base font-semibold">All Suppliers</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Search suppliers and inspect their connected downstream
                  impact.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search name, ID, country..."
                    className="pl-9"
                    aria-label="Search suppliers"
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={(event) =>
                    setTierFilter(
                      event.target.value as "all" | "1" | "2",
                    )
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Filter suppliers by tier"
                >
                  <option value="all">All tiers</option>
                  <option value="1">Tier 1</option>
                  <option value="2">Tier 2</option>
                </select>
              </div>
            </div>

            {filteredSuppliers.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No suppliers match the current filters.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-3 py-3 font-medium">Supplier</th>
                      <th className="px-3 py-3 font-medium">Country</th>
                      <th className="px-3 py-3 font-medium">Tier</th>
                      <th className="px-3 py-3 font-medium">Reliability</th>
                      <th className="px-3 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr
                        key={supplier.supplier_id}
                        className={cn(
                          "border-b last:border-0",
                          selectedSupplierId === supplier.supplier_id &&
                          "bg-muted/30",
                        )}
                      >
                        <td className="px-3 py-4">
                          <p className="font-medium text-foreground">
                            {supplier.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {supplier.supplier_id}
                          </p>
                        </td>
                        <td className="px-3 py-4">{supplier.country}</td>
                        <td className="px-3 py-4">
                          <span className="rounded-full border bg-muted/30 px-2.5 py-1 text-xs">
                            Tier {supplier.tier}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(
                                    supplier.reliability_score,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="font-medium">
                              {supplier.reliability_score.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void viewImpact(supplier.supplier_id)
                            }
                          >
                            View Impact
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">
                  Supplier Impact Preview
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select “View Impact” to inspect downstream connected
                  entities.
                </p>
              </div>

              {selectedSupplier ? (
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="font-medium">{selectedSupplier.name}</span>
                </div>
              ) : null}
            </div>

            {impactLoading ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-xl border bg-muted/30"
                  />
                ))}
              </div>
            ) : impactError ? (
              <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  Impact preview unavailable
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {impactError}
                </p>
              </div>
            ) : impact ? (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Components",
                      value: impact.components.length,
                    },
                    {
                      label: "Products",
                      value: impact.products.length,
                    },
                    {
                      label: "Factories",
                      value: impact.factories.length,
                    },
                    {
                      label: "Regions",
                      value: impact.regions.length,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border bg-muted/20 p-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">
                      Components & Products
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...impact.components, ...impact.products].map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded-md border bg-background px-2.5 py-1.5 text-xs"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">
                      Factories & Regions
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...impact.factories, ...impact.regions].map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded-md border bg-background px-2.5 py-1.5 text-xs"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={() => {
                      window.location.hash = "#impact-analysis";
                    }}
                  >
                    Open Full Impact Analysis
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Choose a supplier from the table to preview its graph
                  impact.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

type ImpactStageProps = {
  title: string;
  relationLabel: string;
  items: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const ImpactStage = ({
  title,
  relationLabel,
  items,
  icon: Icon,
}: ImpactStageProps) => {
  return (
    <div className="flex w-[210px] shrink-0 flex-col rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg border bg-background/60 px-3 py-2 text-xs font-medium text-foreground"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3">
        <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-medium tracking-wide text-muted-foreground">
          {relationLabel}
        </span>
      </div>
    </div>
  );
};

const ImpactConnector = ({ label }: { label: string }) => {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-2">
      <span className="rounded-full border bg-background px-2 py-1 text-[9px] font-semibold tracking-wide text-muted-foreground">
        {label}
      </span>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
    </div>
  );
};

const ImpactAnalysisContent = () => {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = React.useState("");
  const [impact, setImpact] = React.useState<SupplierImpact | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const analyzeSupplier = React.useCallback(async (supplierId: string) => {
    if (!supplierId) return;

    try {
      setAnalyzing(true);
      setError(null);
      const data = await getSupplierImpact(supplierId);
      setImpact(data);
    } catch (err) {
      setImpact(null);
      setError(
        err instanceof Error ? err.message : "Unable to analyze supplier impact.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        setError(null);
        const data = await getSuppliers();

        if (cancelled) return;

        setSuppliers(data);
        const firstSupplierId = data[0]?.supplier_id ?? "";
        setSelectedSupplierId(firstSupplierId);

        if (firstSupplierId) {
          await analyzeSupplier(firstSupplierId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load suppliers.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSuppliers(false);
        }
      }
    };

    void loadSuppliers();

    return () => {
      cancelled = true;
    };
  }, [analyzeSupplier]);

  const selectedSupplier = suppliers.find(
    (supplier) => supplier.supplier_id === selectedSupplierId,
  );

  return (
    <main
      id="impact-analysis"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Live CognoDB Traversal
              </span>
              <span className="rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                4-hop impact path
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Supplier Impact Analysis
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a supplier to trace downstream dependencies across
              components, products, factories, and destination regions.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="sr-only" htmlFor="supplier-impact-select">
              Select supplier
            </label>
            <select
              id="supplier-impact-select"
              value={selectedSupplierId}
              disabled={loadingSuppliers || suppliers.length === 0}
              onChange={(event) => setSelectedSupplierId(event.target.value)}
              className="h-10 min-w-[260px] rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.name} ({supplier.supplier_id})
                </option>
              ))}
            </select>
            <Button
              onClick={() => void analyzeSupplier(selectedSupplierId)}
              disabled={!selectedSupplierId || analyzing || loadingSuppliers}
            >
              {analyzing ? "Analyzing…" : "Analyze Impact"}
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium text-destructive">Impact analysis unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </section>
      ) : null}

      {analyzing && !impact ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border bg-card p-5"
            >
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-5 h-7 w-12 rounded bg-muted" />
            </div>
          ))}
        </section>
      ) : null}

      {impact ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Affected Components",
                value: impact.components.length,
                icon: Package,
              },
              {
                label: "Affected Products",
                value: impact.products.length,
                icon: Box,
              },
              {
                label: "Factories Reached",
                value: impact.factories.length,
                icon: Truck,
              },
              {
                label: "Regions Exposed",
                value: impact.regions.length,
                icon: Globe,
              },
            ].map(({ label, value, icon: MetricIcon }) => (
              <div key={label} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <MetricIcon className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">Downstream Impact Path</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {impact.supplier_name} propagates through four relationship
                  layers in the supply-chain graph.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Supplier → Component → Product → Factory → Region
              </div>
            </div>

            <div className="mt-5 overflow-x-auto pb-2">
              <div className="flex min-w-max items-stretch">
                <ImpactStage
                  title="Supplier"
                  relationLabel={impact.supplier_id}
                  items={[impact.supplier_name]}
                  icon={Users}
                />
                <ImpactConnector label="SUPPLIES" />
                <ImpactStage
                  title="Components"
                  relationLabel="COMPONENT"
                  items={impact.components}
                  icon={Package}
                />
                <ImpactConnector label="USED_IN" />
                <ImpactStage
                  title="Products"
                  relationLabel="PRODUCT"
                  items={impact.products}
                  icon={Box}
                />
                <ImpactConnector label="MANUFACTURED_AT" />
                <ImpactStage
                  title="Factories"
                  relationLabel="FACTORY"
                  items={impact.factories}
                  icon={Truck}
                />
                <ImpactConnector label="SHIPS_TO" />
                <ImpactStage
                  title="Regions"
                  relationLabel="REGION"
                  items={impact.regions}
                  icon={Globe}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold">Selected Supplier</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Supplier</p>
                  <p className="mt-1 font-medium">{impact.supplier_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Supplier ID</p>
                  <p className="mt-1 font-medium">{impact.supplier_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="mt-1 font-medium">
                    {selectedSupplier?.country ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reliability</p>
                  <p className="mt-1 font-medium">
                    {selectedSupplier
                      ? `${selectedSupplier.reliability_score.toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold">Why this matters</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This traversal reveals the cascading business impact of a single
                supplier without manually joining several relational tables. The
                backend executes the graph query in CognoDB and returns the
                connected downstream entities to this interface.
              </p>
            </div>
          </section>
        </>
      ) : null}

      {!loadingSuppliers && !error && suppliers.length === 0 ? (
        <section className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No suppliers are available for impact analysis.
          </p>
        </section>
      ) : null}
    </main>
  );
};

const DashboardContent = () => {
  return (
    <main
      id="dashboard-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 overflow-auto bg-background p-3 sm:p-4 md:p-6"
    >
      <div className="flex flex-col gap-4 xl:flex-row">
        <RiskEventOverview />
        <StatsCardsGrid />
      </div>
      <div className="flex flex-col gap-4 xl:flex-row">
        <SupplierReliabilityChart />
        <RiskEventsPanel />
      </div>
    </main>
  );
};

const getViewFromHash = (): ViewId => {
  if (typeof window === "undefined") return "dashboard";

  if (window.location.hash === "#risk-events") {
    return "risk-events";
  }

  if (window.location.hash === "#products") {
    return "products";
  }

  if (window.location.hash === "#components") {
    return "components";
  }

  if (window.location.hash === "#factories") {
    return "factories";
  }

  if (window.location.hash === "#suppliers") {
    return "suppliers";
  }

  if (window.location.hash === "#impact-analysis") {
    return "impact-analysis";
  }

  if (window.location.hash === "#graph-explorer") {
    return "graph-explorer";
  }

  if (window.location.hash === "#regions") {
    return "regions";
  }

  if (window.location.hash === "#alerts") {
    return "alerts";
  }

  if (window.location.hash === "#critical-components") {
    return "critical-components";
  }

  return "dashboard";
};

const Dashboard6 = ({ className }: { className?: string }) => {
  const [activeView, setActiveView] = React.useState<ViewId>(getViewFromHash);

  React.useEffect(() => {
    const handleHashChange = () => {
      setActiveView(getViewFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <TooltipProvider>
      <SidebarProvider className={cn("bg-sidebar", className)}>
        <a
          href={
            activeView === "risk-events"
              ? "#risk-events-main"
              : activeView === "products"
                ? "#products-main"
                : activeView === "components"
                  ? "#components-main"
                  : activeView === "factories"
                    ? "#factorys-main"
                    : activeView === "suppliers"
                      ? "#suppliers-main"
                      : activeView === "impact-analysis"
                        ? "#impact-analysis"
                        : activeView === "graph-explorer"
                          ? "#graph-explorer-main"
                          : activeView === "regions"
                            ? "#regions-main"
                            : activeView === "alerts"
                              ? "#alerts-main"
                              : activeView === "critical-components"
                                ? "#critical-components-main"
                                : "#dashboard-main"
          }
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <AppSidebar activeView={activeView} />
        <div className="h-svh w-full overflow-hidden lg:p-2">
          <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden bg-background lg:rounded-xl lg:border">
            <DashboardHeader activeView={activeView} />
            {activeView === "risk-events" ? (
              <RiskEventsPage />
            ) : activeView === "products" ? (
              <ProductsPage />
            ) : activeView === "components" ? (
              <ComponentsPage />
            ) : activeView === "factories" ? (
              <FactoriesPage />
            ) : activeView === "suppliers" ? (
              <SuppliersContent />
            ) : activeView === "impact-analysis" ? (
              <ImpactAnalysisContent />
            ) : activeView === "graph-explorer" ? (
              <GraphExplorer />
            ) : activeView === "regions" ? (
              <RegionsPage />
            ) : activeView === "alerts" ? (
              <AlertsPage />
            ) : activeView === "critical-components" ? (
              <CriticalComponentsPage />
            ) : (
              <DashboardContent />
            )}
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export { Dashboard6 };
