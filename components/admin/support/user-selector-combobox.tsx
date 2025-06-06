"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { AdminUser } from "@/types/admin"

interface UserSelectorComboboxProps {
  users: AdminUser[]
  selectedUser: AdminUser | null
  onSelectUser: (user: AdminUser | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyStateMessage?: string
  className?: string
}

export function UserSelectorCombobox({
  users,
  selectedUser,
  onSelectUser,
  placeholder = "Select user...",
  searchPlaceholder = "Search user...",
  emptyStateMessage = "No user found.",
  className,
}: UserSelectorComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between glass text-theme-secondary hover:text-theme-primary",
            className,
            selectedUser ? "text-theme-primary" : "text-theme-muted",
          )}
        >
          {selectedUser ? (
            <div className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              {selectedUser.name} ({selectedUser.email})
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 glass" side="bottom" align="start">
        <Command
          filter={(value, search) => {
            const user = users.find(
              (u) => u.id.toLowerCase() === value.toLowerCase() || u.name.toLowerCase() === value.toLowerCase(),
            )
            if (user) {
              if (user.name.toLowerCase().includes(search.toLowerCase())) return 1
              if (user.email.toLowerCase().includes(search.toLowerCase())) return 1
            }
            return 0
          }}
        >
          <CommandInput placeholder={searchPlaceholder} className="glass-input border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>{emptyStateMessage}</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name} // Use name for display and initial filtering, or ID if preferred
                  onSelect={() => {
                    onSelectUser(user.id === selectedUser?.id ? null : user)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-slate-700/50"
                >
                  <UserIcon
                    className={cn("mr-2 h-4 w-4", selectedUser?.id === user.id ? "opacity-100" : "opacity-60")}
                  />
                  <span className="mr-2">{user.name}</span>
                  <span className="text-xs text-theme-muted">{user.email}</span>
                  <Check
                    className={cn("ml-auto h-4 w-4", selectedUser?.id === user.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
