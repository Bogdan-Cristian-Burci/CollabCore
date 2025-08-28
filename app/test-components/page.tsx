"use client"

import { useState } from "react"
import { MultiSelect } from "@/components/ui/multi-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

const testUsers = [
  { label: "John Doe (john@example.com)", value: "1" },
  { label: "Jane Smith (jane@example.com)", value: "2" },
  { label: "Bob Johnson (bob@example.com)", value: "3" },
  { label: "Alice Brown (alice@example.com)", value: "4" },
]

export default function TestComponentsPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [drawerSelectedUsers, setDrawerSelectedUsers] = useState<string[]>([])
  const [drawerSelectedDate, setDrawerSelectedDate] = useState<Date | undefined>(undefined)

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Component Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Multi-Select Test (Outside Drawer)</h2>
        <MultiSelect
          options={testUsers}
          onValueChange={setSelectedUsers}
          defaultValue={selectedUsers}
          placeholder="Select users..."
          maxCount={3}
          className="w-full max-w-md"
        />
        <div className="text-sm text-gray-600">
          Selected: {JSON.stringify(selectedUsers)}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Date Picker Test (Outside Drawer)</h2>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Pick a date"
          className="w-full max-w-md"
        />
        <div className="text-sm text-gray-600">
          Selected Date: {selectedDate ? selectedDate.toISOString() : 'None'}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Inside Drawer</h2>
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Open Drawer Test</Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <div className="mx-auto w-full max-w-2xl">
              <DrawerHeader>
                <DrawerTitle>Test Components in Drawer</DrawerTitle>
                <DrawerDescription>
                  Testing if components work inside drawer
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Multi-Select in Drawer</h3>
                  <MultiSelect
                    options={testUsers}
                    onValueChange={setDrawerSelectedUsers}
                    defaultValue={drawerSelectedUsers}
                    placeholder="Select users in drawer..."
                    maxCount={3}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">
                    Selected: {JSON.stringify(drawerSelectedUsers)}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Date Picker in Drawer</h3>
                  <DatePicker
                    value={drawerSelectedDate}
                    onChange={setDrawerSelectedDate}
                    placeholder="Pick date in drawer"
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">
                    Selected Date: {drawerSelectedDate ? drawerSelectedDate.toISOString() : 'None'}
                  </div>
                </div>
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}