'use client';

import * as React from 'react';
import { ElementType } from 'react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Plug,
  Settings,
  Globe,
  Key,
  Webhook,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import type { MainNavItem, SidebarNavItem } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useTheme } from '@/components/theme-provider';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: 'Documentation',
      href: '/docs',
    },
    {
      title: 'Support',
      href: '/support',
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Goals Calculator',
      href: '/goals',
      icon: Calculator,
    },
    {
      title: 'Activity Log',
      href: '/activity',
      icon: FileText,
    },
    {
      title: 'Integrations',
      icon: Plug,
      items: [
        {
          title: 'Browse Integrations',
          href: '/integrations',
          icon: Globe,
        },
        {
          title: 'API Keys',
          href: '/integrations/api-keys',
          icon: Key,
        },
        {
          title: 'Webhooks',
          href: '/integrations/webhooks',
          icon: Webhook,
        },
      ],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { actualTheme } = useTheme();
  const { isCollapsed } = useSidebarState();
  const router = useRouter();

  useEffect(() => {
    console.log(
      '[CLIENT] AppSidebar component mounted or pathname changed:',
      pathname
    );
  }, [pathname]);

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const activeParent = dashboardConfig.sidebarNav.find(
      (item) =>
        item.items &&
        item.items.some(
          (subItem) => subItem.href && pathname.startsWith(subItem.href)
        )
    );
    return activeParent ? [activeParent.title] : [];
  });

  const isActive = (href: string | undefined) => {
    if (!href) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  const sidebarBg =
    actualTheme === 'dark'
      ? 'bg-gradient-to-b from-zinc-900 to-black'
      : 'bg-gradient-to-b from-gray-100 to-gray-200/80 backdrop-blur-md';
  const borderColor =
    actualTheme === 'dark' ? 'border-zinc-700/50' : 'border-gray-300/70';

  const getMenuItemStyles = (isActive: boolean) => {
    const baseStyle =
      'rounded-xl transition-all duration-300 font-medium border';

    if (actualTheme === 'dark') {
      // Dark theme styles
      return isActive
        ? `${baseStyle} bg-gradient-to-br from-red-500/95 via-red-600/90 to-red-700/95 border-red-300/50 text-white shadow-lg shadow-red-500/20 backdrop-blur-[12px] animate-subtle-pulse ring-1 ring-red-400/30`
        : `${baseStyle} text-gray-300 border-transparent hover:text-white hover:bg-gradient-to-r hover:from-red-600/30 hover:to-red-500/20 hover:border-red-400/20 hover:backdrop-blur-[4px] hover:shadow-md hover:shadow-red-500/10`;
    } else {
      // Light theme styles
      return isActive
        ? `${baseStyle} bg-gradient-to-br from-red-500/95 via-red-600/90 to-red-700/95 border-red-300/60 text-white shadow-lg shadow-red-500/15 backdrop-blur-[12px] animate-subtle-pulse ring-1 ring-red-400/40`
        : `${baseStyle} text-gray-700 border-transparent hover:text-red-900 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-400/10 hover:border-red-400/20 hover:backdrop-blur-[4px] hover:shadow-sm hover:shadow-red-500/10`;
    }
  };

  const MenuItemWithTooltip = ({
    item,
    isActive,
  }: {
    item: { title: string; href: string; icon: ElementType };
    isActive: boolean;
  }) => {
    const router = useRouter();

    const handleNavigation = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(item.href);
    };

    const commonButtonClasses = `h-12 justify-center ${getMenuItemStyles(isActive)}`;
    const collapsedButtonClasses = `${commonButtonClasses} w-12 p-0 sidebar-collapsed-icon`;
    const expandedButtonClasses = `${commonButtonClasses} px-3 justify-start`;

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              onClick={handleNavigation}
              className={collapsedButtonClasses}
            >
              <div className='flex items-center justify-center transition-all duration-300 w-full h-full'>
                {item.icon && React.createElement(item.icon, {
                  className: `h-5 w-5 flex-shrink-0 ${isActive ? 'drop-shadow-glow' : ''}`,
                })}
              </div>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent
            side='right'
            className={`z-50 font-medium backdrop-blur-sm border shadow-lg ${
              actualTheme === 'dark'
                ? 'bg-zinc-900/95 border-zinc-700 text-white'
                : 'bg-white/95 border-gray-200 text-black shadow-md'
            }`}
            sideOffset={16}
            align='center'
          >
            <span className='whitespace-nowrap'>{item.title}</span>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <SidebarMenuButton
        onClick={handleNavigation}
        className={expandedButtonClasses}
      >
        <div className='flex items-center gap-3 transition-all duration-300'>
          {item.icon && React.createElement(item.icon, {
            className: `h-5 w-5 flex-shrink-0 ${isActive ? 'drop-shadow-glow' : ''}`,
          })}
          <span className='transition-opacity duration-300 opacity-100'>
            {item.title}
          </span>
        </div>
      </SidebarMenuButton>
    );
  };

  return (
    <TooltipProvider>
      <style jsx global>{`
        @keyframes subtle-pulse {
          0%,
          100% {
            box-shadow:
              0 10px 15px -3px rgba(239, 68, 68, 0.15),
              0 4px 6px -2px rgba(239, 68, 68, 0.1);
          }
          50% {
            box-shadow:
              0 15px 20px -3px rgba(239, 68, 68, 0.2),
              0 6px 8px -2px rgba(239, 68, 68, 0.15);
          }
        }

        .animate-subtle-pulse {
          animation: subtle-pulse 3s ease-in-out infinite;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
        }
      `}</style>
      <Sidebar
        className={`border-r ${borderColor} transition-colors duration-300`}
        {...props}
      >
        <SidebarContent className={`${sidebarBg} transition-all duration-300`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu
                className={`space-y-2 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}
              >
                {dashboardConfig.sidebarNav.map((item) => {
                  if (item.items) {
                    const expanded = isExpanded(item.title);
                    const isParentActive = item.items.some((subItem) =>
                      isActive(subItem.href)
                    );

                    return (
                      <div key={item.title}>
                        <SidebarMenuItem
                          className={isCollapsed ? 'flex justify-center' : ''}
                        >
                          {isCollapsed ? (
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`flex items-center justify-center w-12 h-12 p-0 ${getMenuItemStyles(isParentActive)} sidebar-collapsed-icon`}
                                >
                                  {item.icon && React.createElement(item.icon, {
                                    className: `h-5 w-5 flex-shrink-0 ${isParentActive ? 'drop-shadow-glow' : ''}`,
                                  })}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side='right'
                                className={`z-50 font-medium backdrop-blur-sm border shadow-lg ${
                                  actualTheme === 'dark'
                                    ? 'bg-zinc-900/95 border-zinc-700 text-white'
                                    : 'bg-white/95 border-gray-200 text-black shadow-md'
                                }`}
                                sideOffset={16}
                                align='center'
                              >
                                <span className='whitespace-nowrap'>
                                  {item.title}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <SidebarMenuButton
                              onClick={() => toggleExpanded(item.title)}
                              className={`h-12 justify-between px-3 w-full ${getMenuItemStyles(isParentActive)}`}
                            >
                              <div className='flex items-center gap-3'>
                                {item.icon && React.createElement(item.icon, {
                                  className: `h-5 w-5 flex-shrink-0 ${isParentActive ? 'drop-shadow-glow' : ''}`,
                                })}
                                <span>{item.title}</span>
                              </div>
                              {expanded ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                        {expanded && !isCollapsed && (
                          <div className='ml-4 pl-3 border-l border-dashed border-slate-700/50 mt-1 space-y-1'>
                            {item.items.map((subItem) => {
                              const isSubItemActive = isActive(subItem.href);
                              return (
                                <SidebarMenuItem key={subItem.title}>
                                  <SidebarMenuButton
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (subItem.href)
                                        router.push(subItem.href);
                                    }}
                                    className={`h-10 justify-start px-3 w-full ${getMenuItemStyles(isSubItemActive)}`}
                                  >
                                    <div className='flex items-center gap-3'>
                                      {subItem.icon && React.createElement(subItem.icon, {
                                        className: `h-4 w-4 flex-shrink-0 ${isSubItemActive ? 'drop-shadow-glow' : ''}`,
                                      })}
                                      <span>{subItem.title}</span>
                                    </div>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Direct link items
                  const isItemActive = isActive(item.href);
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className={isCollapsed ? 'flex justify-center' : ''}
                    >
                      <MenuItemWithTooltip
                        item={{
                          title: item.title,
                          href: item.href || '#',
                          icon: item.icon as ElementType,
                        }}
                        isActive={isItemActive}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
