<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
  
    import { TypeDataFetcher, type ItemType } from "$lib/inventory/type.svelte";    
    import Button from "$lib/components/ui/button/button.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import UpArrow from "$lib/icons/upArrow.svelte";
    import DownArrow from "$lib/icons/downArrow.svelte";
    import Garbage from "$lib/icons/garbage.svelte";
    import Pencil from "$lib/icons/pencil.svelte";
    import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";

    import Confirm  from "../confirm.svelte";

    // Define the SortOptions type
    type SortOptions = {
        name: number | undefined;
    };
  
    // Initialize sort with default values
    let sort: SortOptions = $state({
        name: undefined,

    });
  
    // Declare reactive variables
    let items: ItemType[] = $state([]);
    let d = new TypeDataFetcher(10);

    // Automatically update items whenever data changes in EverythingDataFetcher
    $effect(() => {
        d.get().then(e => { items = e; });
    });
  
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
    }
  
    let filterValue = $state("")
  
    type filterOptions = {
      name: string | undefined; // Use lowercase 'number' for TypeScript
    };
  
    let filterObject:filterOptions = 
    {
      name: undefined
    }
  
    function filter()
    {
      if (filterValue == "")
      {
        filterObject.name = undefined

      }
      else 
      {
        filterObject.name = filterValue

      }
  
      d.filter = filterObject
    }

    let confirmYes = $state(()=>{})
    let open = $state(false)


    function remove(name:string)
    {
        open = true;
        confirmYes = () => 
        {
            d.remove(name).then(e=> 
                {
                    const index = items.findIndex(item=> item.name == name)
                    items.splice(index,1);
                    toast("Item Deleted Successfully")
                }
            ).catch(e=> 
                {
                    toast(`Failed to delete inventory type: ${e.error}`)
                }
            )

            open = false;
        }

    }

    function edit(name:string)
    {
        goto(`inventoryTypes/editInventoryType?typeName=${name}`)
    }
  
  </script>

    <Confirm description={"This is a destructive action!"} yes={confirmYes} no={()=>open = false} open={open}/>


  <div class="flex items-center gap-4">
    <Input bind:value={filterValue} name="filter" class=' w-36'/>
    <Button onclick={filter}>Filter</Button>
  </div>
  <Table.Root class="">
    <Table.Header>
        <Table.Row>
            <Table.Head onclick={() => setSort("name")} class="hover:text-black cursor-pointer w-1/4">
                Report name 
                {#if sort.name === -1}
                <UpArrow/>
                {/if}
                {#if sort.name === 1}
                <DownArrow/>
                {/if}
            </Table.Head>
            <Table.Head class="hover:text-black w-2/4">Attributes</Table.Head>

            <Table.Head class="hover:text-black w-1/4">Tools</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each items as item}
            <Table.Row>
                <Table.Cell class="font-medium">{item.name}</Table.Cell>
                <Table.Cell class="flex flex-wrap gap-2">
                    {#each item.attributes as attrib}
                        <Badge variant="outline">{attrib.attributeName}</Badge>
                    {/each}
                </Table.Cell>

                <Table.Cell>
                    <div class="flex gap-2">
                        <button onclick={()=>remove(item.name)}>
                            <Garbage/>
                        </button>
                        <button onclick={()=>edit(item.name)}>
                            <Pencil class="text-lg"/>
                        </button>
                    </div>
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
  