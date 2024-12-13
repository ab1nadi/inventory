<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as Pagination from "$lib/components/ui/pagination/index.js";

  import { AggregateDataFetcher, type InventoryItem } from "$lib/inventory/aggregateInventory.svelte";
  
  import Button from "$lib/components/ui/button/button.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import UpArrow from "$lib/icons/upArrow.svelte";
  import DownArrow from "$lib/icons/downArrow.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

  // Define the SortOptions type
  type SortOptions = {
      typeName: number | undefined; // Use lowercase 'number' for TypeScript
      totalCost: number | undefined;
      totalItems: number | undefined;
  };

  // Initialize sort with default values
  let sort: SortOptions = $state({
      typeName: undefined,
      totalCost: undefined,
      totalItems: undefined,
  });

  // Declare reactive variables
  let items: InventoryItem[] = $state([]);
  let d = new AggregateDataFetcher(60);
  // Automatically update items whenever data changes in EverythingDataFetcher
  function getData()
  {
      d.get().then(e => { items = e; });
  }


  onMount(()=> 
  {
    getData()
  })

  // Function to set sorting options
  function setSort(field: keyof SortOptions) {

      console.log(sort)
      if (sort[field] === undefined) {
          sort[field] = 1; // Set to ascending
      } else if (sort[field] === 1) {
          sort[field] = -1; // Set to descending
      } else {
          sort[field] = 1; // Reset to undefined
      }

      d.page = 1 // reset the page

      d.orderBy = sort; // Assign the sort object to the fetcher

      getData()
  }

  let filterValue = $state("")

  type filterOptions = {
    typeName: string | undefined; // Use lowercase 'number' for TypeScript
      totalCost: string | undefined;
      totalItems: string | undefined;
  };

  let filterObject:filterOptions = 
  {
    typeName: undefined,
    totalCost: undefined,
    totalItems: undefined
  }

  function filter()
  {
    if (filterValue == "")
    {
      filterObject.typeName = undefined
      filterObject.totalCost = undefined
      filterObject.totalItems = undefined
    }
    else 
    {
      filterObject.typeName = filterValue
      filterObject.totalCost = filterValue
      filterObject.totalItems = filterValue
    }

    d.filter = filterObject

    getData()
  }

</script>
<div class="flex items-center gap-4">
  <Input bind:value={filterValue} name="filter" class=' w-36'/>
  <Button onclick={filter}>Filter</Button>
</div>
<Table.Root class="">
  <Table.Header>
      <Table.Row>
          <Table.Head onclick={() => setSort("typeName")} class="hover:text-black cursor-pointer">
              Item Type 
              {#if sort.typeName === -1}
              <UpArrow/>
              {/if}
              {#if sort.typeName === 1}
              <DownArrow/>
              {/if}
          </Table.Head>
          <Table.Head onclick={() => setSort("totalCost")} class="hover:text-black cursor-pointer">
              Total Cost
              {#if sort.totalCost === -1}
              <UpArrow/>
              {/if}
              {#if sort.totalCost === 1}
              <DownArrow/>
              {/if}
          </Table.Head>
          <Table.Head onclick={() => setSort("totalItems")} class="hover:text-black cursor-pointer">
              Total Items
              {#if sort.totalItems === -1}
              <UpArrow/>
              {/if}
              {#if sort.totalItems === 1}
              <DownArrow/>
              {/if}
            </Table.Head>
          <Table.Head class="hover:text-black">Attributes</Table.Head>
      </Table.Row>
  </Table.Header>
  <Table.Body>
      {#each items as item}
          <Table.Row class="cursor-pointer" onclick={()=>goto(`/authorized/inventory/inventory?typeName=${item._id.typeName}`)}>
              <Table.Cell class="font-medium">{item._id.typeName}</Table.Cell>
              <Table.Cell>${item.totalCost}</Table.Cell>
              <Table.Cell>{item.totalItems}</Table.Cell>
              <Table.Cell>
                  {#each item.attributes as attrib}
                      <Badge variant="outline">{attrib}</Badge>
                  {/each}
              </Table.Cell>
          </Table.Row>
      {/each}
  </Table.Body>
</Table.Root>

<Pagination.Root controlledPage count={d.total} perPage={10} page={d.page} onPageChange={(p) => {
  d.page = p;
}}>
  {#snippet children({ pages, currentPage })}
      <Pagination.Content>
          <Pagination.Item>
              <Pagination.PrevButton />
          </Pagination.Item>
          {#each pages as page (page.key)}
              {#if page.type === "ellipsis"}
                  <Pagination.Item>
                      <Pagination.Ellipsis />
                  </Pagination.Item>
              {:else}
                  <Pagination.Item>
                      <Pagination.Link {page} isActive={currentPage === page.value}>
                          {page.value}
                      </Pagination.Link>
                  </Pagination.Item>
              {/if}
          {/each}
          <Pagination.Item>
              <Pagination.NextButton />
          </Pagination.Item>
      </Pagination.Content>
  {/snippet}
</Pagination.Root>
