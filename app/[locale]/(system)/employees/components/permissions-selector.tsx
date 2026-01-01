"use client"

import { useTranslations } from "next-intl"
import { PERMISSIONS_GROUPED, type Permission } from "@/config"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

type PermissionsSelectorProps = {
  permissions: string[]
  allowAllPermissions: boolean
  onPermissionsChange: (permissions: string[]) => void
  onAllowAllChange: (checked: boolean) => void
}

export function PermissionsSelector({
  permissions,
  allowAllPermissions,
  onPermissionsChange,
  onAllowAllChange,
}: PermissionsSelectorProps) {
  const t = useTranslations()

  // Create grouped permissions structure
  const permissionGroups = Object.entries(PERMISSIONS_GROUPED).map(
    ([groupKey, groupPermissions]) => {
      // Map group keys to translation keys
      const translationKeyMap: Record<string, string> = {
        PROJECT: "manageProjects",
        TASK: "manageTasks",
        FILE: "fileManagement", // Using manageWebsite as closest match
        STAFF: "manageStaff",
        LIST: "manageLists",
        WEBSITE: "manageWebsite",
        REPORT: "manageReports",
      }
      const translationKey =
        translationKeyMap[groupKey] || groupKey.toLowerCase()
      const groupName = t(`employees.permissions.${translationKey}`, {
        defaultValue: groupKey,
      })

      const permissionsList = Object.entries(groupPermissions).map(
        ([actionKey, permissionKey]) => ({
          id: permissionKey,
          key: permissionKey as Permission,
          name: t(`employees.permissions.${permissionKey}`, {
            defaultValue: permissionKey,
          }),
          action: actionKey,
        })
      )

      return {
        id: groupKey,
        key: groupKey,
        name: groupName,
        permissions: permissionsList,
      }
    }
  )

  // Get all permission keys from grouped structure
  const allPermissionKeys = permissionGroups.flatMap((group) =>
    group.permissions.map((p) => String(p.key))
  )

  const handleAllowAllPermissionsChange = (checked: boolean) => {
    onAllowAllChange(checked)
    if (checked) {
      onPermissionsChange(allPermissionKeys)
    }
    // When unchecking "Allow All", keep current permissions instead of clearing
    // The permissions array will remain as is, just allowAllPermissions becomes false
  }

  const handlePermissionToggle = (
    permissionKey: string | Permission,
    checked?: boolean
  ) => {
    const key = String(permissionKey)
    const currentPermissions = permissions
    const isCurrentlySelected = currentPermissions.includes(key)

    // Use the checked parameter if provided, otherwise toggle
    const shouldBeSelected =
      checked !== undefined ? checked : !isCurrentlySelected

    let newPermissions: string[]
    if (shouldBeSelected) {
      // Add permission if not already present
      newPermissions = isCurrentlySelected
        ? currentPermissions
        : [...currentPermissions, key]
    } else {
      // Remove permission
      newPermissions = currentPermissions.filter((p) => p !== key)
    }

    onPermissionsChange(newPermissions)

    // Update allowAllPermissions based on current selection
    onAllowAllChange(newPermissions.length === allPermissionKeys.length)
  }

  const handleGroupToggle = (groupKey: string) => {
    const group = permissionGroups.find((g) => g.key === groupKey)
    if (!group) return

    const groupPermissionKeys = group.permissions.map((p) => String(p.key))
    const currentPermissions = permissions
    const allGroupPermissionsSelected = groupPermissionKeys.every((key) =>
      currentPermissions.includes(key)
    )

    let updatedPermissions: string[]
    if (allGroupPermissionsSelected) {
      // Remove all permissions from this group
      updatedPermissions = currentPermissions.filter(
        (p) => !groupPermissionKeys.includes(p)
      )
    } else {
      // Add all permissions from this group
      updatedPermissions = [
        ...new Set([...currentPermissions, ...groupPermissionKeys]),
      ]
    }

    onPermissionsChange(updatedPermissions)

    // Update allowAllPermissions based on current selection
    onAllowAllChange(updatedPermissions.length === allPermissionKeys.length)
  }

  return (
    <div className="space-y-4">
      <Field orientation="horizontal">
        <Checkbox
          id="allowAllPermissions"
          checked={allowAllPermissions}
          onCheckedChange={handleAllowAllPermissionsChange}
        />
        <FieldLabel htmlFor="allowAllPermissions">
          {t("employees.form.allowAllPermissions")}
        </FieldLabel>
      </Field>

      <div>
        <p className="mb-3 text-sm font-medium">
          {t("employees.form.permissions")}
        </p>
        <div className="space-y-2 space-x-2">
          {permissionGroups.map((group) => {
            const groupPermissionKeys = group.permissions.map((p) =>
              String(p.key)
            )
            const allGroupPermissionsSelected = groupPermissionKeys.every(
              (key) => permissions.includes(key)
            )
            const selectedInGroup = groupPermissionKeys.filter((key) =>
              permissions.includes(key)
            ).length

            return (
              <Popover key={group.id}>
                <PopoverTrigger
                  render={(props) => (
                    <Button
                      variant="outline"
                      className="w-fit justify-between"
                      {...props}
                    >
                      <div className="flex items-center gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={allGroupPermissionsSelected}
                            onCheckedChange={() => handleGroupToggle(group.key)}
                          />
                        </div>
                        <span>{group.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedInGroup > 0 && (
                          <span className="text-muted-foreground text-sm">
                            {selectedInGroup}/{groupPermissionKeys.length}
                          </span>
                        )}
                        <ChevronDown className="size-4" />
                      </div>
                    </Button>
                  )}
                ></PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`group-checkbox-${group.id}`}
                        checked={allGroupPermissionsSelected}
                        onCheckedChange={() => handleGroupToggle(group.key)}
                      />
                      <FieldLabel
                        htmlFor={`group-checkbox-${group.id}`}
                        className="flex-1 font-medium"
                      >
                        {group.name}
                      </FieldLabel>
                    </Field>
                    <div className="space-y-2">
                      {group.permissions.map((permission) => {
                        const permissionKey = String(permission.key)
                        const isSelected = permissions.includes(permissionKey)

                        return (
                          <Field key={permission.id} orientation="horizontal">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(permissionKey, checked)
                              }
                            />
                            <FieldLabel
                              htmlFor={`permission-${permission.id}`}
                              className="flex-1 text-sm"
                            >
                              {permission.name}
                            </FieldLabel>
                          </Field>
                        )
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          })}
        </div>
      </div>
    </div>
  )
}
