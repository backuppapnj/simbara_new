import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

export function NavSection({ group }: { group: NavGroup }) {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <Collapsible
            asChild
            defaultOpen={true}
            onOpenChange={setIsOpen}
            className="group/collapsible"
        >
            <SidebarGroup>
                <CollapsibleTrigger asChild>
                    <SidebarGroupLabel
                        asChild
                        className="group/label cursor-pointer text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                        <div>
                            {group.title}
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                    </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}
