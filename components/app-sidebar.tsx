"use client";

import Link from "next/link";
import * as React from "react";
import {
  IconAlertTriangle,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconMessages,
  IconReportAnalytics,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "High-Risk Claims",
      url: "/",
      icon: IconAlertTriangle,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReportAnalytics,
    },
    {
      title: "Chat Copilot",
      url: "/chat-examples",
      icon: IconMessages,
    },
  ],
  navSecondary: [
    {
      title: "API Docs",
      url: "https://casemind-ai-production.up.railway.app/docs/swagger",
      icon: IconFileDescription,
    },
    {
      title: "Support",
      url: "mailto:support@casemind.ai",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Casemind AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
