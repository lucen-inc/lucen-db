import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/lid/app-shell";

function NotFoundComponent() {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Lucen Intelligence
        </div>
        <h1 className="mt-3 text-7xl font-semibold tracking-tight text-gradient">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This record isn&rsquo;t in the intelligence graph.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-border/60 bg-elevated px-4 py-2 text-sm font-medium hover:border-cyan/40"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something disrupted the signal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The intelligence layer failed to load. You can retry or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
          <a
            href="/"
            className="rounded-lg border border-border/60 bg-elevated px-4 py-2 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard · Lucen Intelligence Database" },
      {
        name: "description",
        content:
          "The intelligence operating system for Lucen — organizations, people, buildings and relationships in one connected graph.",
      },
      { property: "og:title", content: "Dashboard · Lucen Intelligence Database" },
      {
        property: "og:description",
        content:
          "The intelligence operating system for Lucen — organizations, people, buildings and relationships in one connected graph.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dashboard · Lucen Intelligence Database" },
      { name: "twitter:description", content: "The intelligence operating system for Lucen — organizations, people, buildings and relationships in one connected graph." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Aho1PfCYoITTu3qbzSI7zPyEErI2/social-images/social-1784177034114-real-estate_-skyline-of-tommorow.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Aho1PfCYoITTu3qbzSI7zPyEErI2/social-images/social-1784177034114-real-estate_-skyline-of-tommorow.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://rsms.me/",
      },
      { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}
