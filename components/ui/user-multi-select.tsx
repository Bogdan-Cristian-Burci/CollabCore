"use client"

import * as React from "react"
import { CheckIcon, X } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { MultiSelect } from "./multi-select"
import { UserResource } from "@/types/user"

// Avatar renderer for selected users
export function UserAvatar({ 
  user, 
  onRemove 
}: { 
  user: UserResource
  onRemove: () => void 
}) {
  const name = user.name || user.email
  const initials = getInitials(name)

  return (
    <div
      className="relative inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-primary rounded-full border-2 border-white shadow-sm z-10 m-1 transition-all duration-200 hover:scale-110"
      title={`${user.name} (${user.email})`}
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
      }}
    >
      <span className="text-xs font-semibold">{initials}</span>
      <X
        className="absolute -top-1 -right-1 h-4 w-4 cursor-pointer bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors z-20"
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onRemove()
        }}
      />
    </div>
  )
}

// List item renderer for dropdown
export function UserListItem({ 
  user, 
  isSelected, 
  onToggle 
}: { 
  user: UserResource
  isSelected: boolean
  onToggle: () => void 
}) {
  const name = user.name || user.email
  const initials = getInitials(name)

  return (
    <>
      <div
        className={cn(
          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <CheckIcon className="h-4 w-4" />
      </div>
      
      {/* User Avatar in dropdown */}
      <div className="flex items-center gap-3 flex-1">
        <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-primary rounded-full">
          <span className="text-xs font-semibold">{initials}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
    </>
  )
}

// Pre-configured MultiSelect for users
interface UserMultiSelectProps {
  users: UserResource[]
  selectedUsers: UserResource[]
  onSelectionChange: (users: UserResource[]) => void
  placeholder?: string
  disabled?: boolean
  maxCount?: number
  className?: string
  showSelectAll?: boolean
}

export function UserMultiSelect({
  users,
  selectedUsers,
  onSelectionChange,
  placeholder = "Select users...",
  disabled = false,
  maxCount = 5,
  className,
  showSelectAll = true,
}: UserMultiSelectProps) {
  return (
    <MultiSelect
      items={users}
      selectedItems={selectedUsers}
      onSelectionChange={onSelectionChange}
      getItemKey={(user) => user.id}
      getItemLabel={(user) => `${user.name} ${user.email}`}
      renderSelectedItem={(user, onRemove) => (
        <UserAvatar user={user} onRemove={onRemove} />
      )}
      renderListItem={(user, isSelected, onToggle) => (
        <UserListItem user={user} isSelected={isSelected} onToggle={onToggle} />
      )}
      placeholder={placeholder}
      disabled={disabled}
      maxCount={maxCount}
      className={className}
      showSelectAll={showSelectAll}
    />
  )
}