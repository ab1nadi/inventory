<script lang="ts" module>
	// sample data
	const data = {
		authNav: [
			{
				title: "Inventory",
				url: "#",
				items: [
					{
						title: "Aggregate",
						url: "/authorized/inventory/aggregateInventory",
					},
					{
						title: "Items",
						url: "/authorized/inventory/inventory",
					},
				],
			},
			{
				title: "Inventory Types",
				url: "#",
				items: [
					{
						title: "Types",
						url: "/authorized/inventory/inventoryTypes",
					}
				],
			},

			{
				title: "Reporting",
				url: "#",
				items: [
					{
						title: "Reports",
						url: "/authorized/reports/reports",
					},
					{
						title: "Report Results & Status",
						url: "/authorized/reports/reportStatuses",
					}
				],
			},

			{
				title: "Imports",
				url: "#",
				items: [
					{
						title: "Import Inventory",
						url: "/authorized/import",
					}
				],
			}
		],

	};
</script>

<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Collapsible from "$lib/components/ui/collapsible"
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import { onMount, type ComponentProps } from "svelte";
	import Button from "./ui/button/button.svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();


	import { userSession } from "$lib/userSession/userSession.svelte";
	import { goto } from "$app/navigation";
	import FailedLoginsTable from "./tables/failedLoginsTable.svelte";

	let loggedIn = $state(false)

	$effect(()=>
	{
		loggedIn = userSession.loggedIn
	})
		
</script>

<Sidebar.Root bind:ref {...restProps} class="bg-slate-500 z-30">
	<Sidebar.Header class="bg-gray-800 h-12">
		<div class="w-full h-full flex items-center">
    	<h1 class="text-white ml-3"> NSSD Inventory</h1>
		</div>
	</Sidebar.Header>
	<Sidebar.Content class="gap-0">
		<!-- We create a Sidebar.Group for each parent. -->

		{#if loggedIn}
			{#each data.authNav as group (group.title)}
				<Collapsible.Root title={group.title} open={false} class="group/collapsible">
					<Sidebar.Group>
						<Sidebar.GroupLabel
							class="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
						>
							{#snippet child({ props })}
								<Collapsible.Trigger {...props}>
									<div class="hover:text-white flex flex-row w-full justify-between">
									{group.title}
									
									<ChevronRight
										class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
									/>

								</div>
								</Collapsible.Trigger>
							{/snippet}
						</Sidebar.GroupLabel>
						<Collapsible.Content>
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									{#each group.items as item (item.title)}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton class="ml-3 hover:bg-white">
												{#snippet child({ props })}
													<a href={item.url} {...props}>{item.title}</a>
												{/snippet}
											</Sidebar.MenuButton>
										</Sidebar.MenuItem>
									{/each}
								</Sidebar.Menu>
							</Sidebar.GroupContent>
						</Collapsible.Content>
					</Sidebar.Group>
				</Collapsible.Root>
			{/each}
		{/if}

	</Sidebar.Content>

	<Sidebar.Footer>

		{#if loggedIn}
		<FailedLoginsTable></FailedLoginsTable>
		{/if}
		<div class="w-full h-12 flex items-center ml-3">
			{#if loggedIn}
				<Button onclick={()=>{userSession.logout(); goto('/')}}>log Out</Button>
			{:else}
				<Button onclick={()=>goto('/')}>log In</Button>
			{/if}
		</div>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>