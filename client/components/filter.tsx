'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { carFilterOptions } from "@/constants"

export default function Filter() {
  const { push } = useRouter();
  const [selectedValue, setSelectedValue] = useState<{ type: string | null; capacity: number | null }>({
    type: null,
    capacity: null
  });


  const handleTypeChange = (type: string) => {
    setSelectedValue((prev) => ({
      type: prev.type === type ? null : type,
      capacity: prev.capacity
    }));

  };

  const handleCapacityChange = (capacity: number) => {
    setSelectedValue((prev) => ({
      type: prev.type,
      capacity: prev.capacity === capacity ? null : capacity
    }));

  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedValue.type) params.append("type", selectedValue.type);
    if (selectedValue.capacity !== null) params.append("capacity", selectedValue.capacity.toString());

    if (selectedValue.type && selectedValue.capacity !== null) {
      params.append("search_by", "type_cap");
    } else if (selectedValue.type) {
      params.append("search_by", "type");
    } else if (selectedValue.capacity !== null) {
      params.append("search_by", "capacity");
    }

    push(`/search?${params.toString()}`);
  }, [selectedValue, push]);


  return (
    <Sidebar className="mt-14">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Type</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {carFilterOptions.type.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <div>
                      <input
                        type="checkbox"
                        onChange={() => handleTypeChange(item.label.toLowerCase())}
                        checked={selectedValue.type === item.label.toLowerCase()}
                      />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Capacity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {carFilterOptions.capacity.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <div>
                      <input
                        type="checkbox"
                        onChange={() => handleCapacityChange(parseInt(item.label))}
                        checked={selectedValue.capacity === parseInt(item.label)}
                      />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

