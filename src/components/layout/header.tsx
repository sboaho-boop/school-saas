'use client';

import { Bell, Search, User, Globe, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { SidebarNavContent } from '@/components/layout/sidebar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, string> = {
  fee_reminder: '💰',
  task_deadline: '📋',
  attendance_alert: '📊',
  exam_announcement: '📝',
  general: '📢',
};

const roleLabels: Record<string, string> = {
  headteacher: 'Head Teacher',
  admin: 'Administrator',
  accountant: 'Accountant',
  teaching: 'Teacher',
  'non-teaching': 'Staff',
};

export function Header() {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const user = useAuthStore((s) => s.currentUser);
  const { theme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background to-muted/80 px-3 sm:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <div className="flex h-16 items-center border-b border-sidebar-border px-4">
              <span className="text-lg font-bold text-sidebar-foreground">{theme.schoolName}</span>
            </div>
            <SidebarNavContent />
          </SheetContent>
        </Sheet>
        <div className="relative w-40 sm:w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Globe size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Language</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
            <DropdownMenuItem>Kiswahili</DropdownMenuItem>
            <DropdownMenuItem>العربية</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex flex-col items-start gap-1 py-3',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{notificationIcons[notification.type] || '📢'}</span>
                    <span className="text-sm font-medium">{notification.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User size={16} />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user ? roleLabels[user.staffType] || user.role : ''}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }}>
              <LogOut size={14} className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
