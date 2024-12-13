<script lang="ts">

    import { page } from "$app/stores";

    // Access the query parameters
    const queryParams = $page.url.searchParams;
   
    // Example: Getting a specific query parameter by name
    const typeName = queryParams.get('typeName');


    // Ui components
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input";
    import UpArrow from "$lib/icons/upArrow.svelte";
    import DownArrow from "$lib/icons/downArrow.svelte";
    import Garbage from "$lib/icons/garbage.svelte";
    import Pencil from "$lib/icons/pencil.svelte";
    import Label from "../ui/label/label.svelte";

    import Confirm from "../confirm.svelte";


    
    // data fetchers
    import { InventoryDataFetcher, type InventoryItem } from "$lib/inventory/inventory.svelte";
    import { TypeDataFetcher, type ItemType } from "$lib/inventory/type.svelte";

    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
    

    // Inventory variables
    let items: InventoryItem[] = $state([]);
    let d = new InventoryDataFetcher(10);

    // Variables that set the selected type
    let selectedType = $state("")
    let attributeNamesTypes:{attributeName:string, attributeType:string}[] = $state([])

    // messages for if there is no content
    let message = $state("")
    let showPager = $state(true)

    // Type fetcher
    let t_fetch = new TypeDataFetcher(100000);
    let inventoryTypes:ItemType[] = $state([])


    // fetch all the inventory types on mount 
    // so that we can pass them to the inventory select
    onMount(async ()=>
    {
        // get all possible inventory types
        inventoryTypes = await t_fetch.get()


        if(typeName)
        {
            d.setTypeName(typeName as string)
            selectedType = typeName as string
        }
        else 
        {
            let i = inventoryTypes[0]
            d.setTypeName(i.name)
            selectedType = i.name
        }

        getData()
        
    })



    async function setTableType()
    {
        sorts = {}
        d.setTypeName(selectedType)
        getData()
    }


    async function getData()
    {
        let gotten = await d.get()
        items = gotten;

        attributeNamesTypes = []

        if(items.length == 0)
        {
            message = `No inventory items of type ${d.typeName}`
            showPager = false
        }
        else 
        {
            message = ""
            showPager = true


            for (let attr of Object.keys(items[0].attributes))
                attributeNamesTypes.push({attributeName:attr, attributeType: typeof (items[0].attributes[attr])})
        }
    }

    // stuff dealing with sorting 
    let sorts:Record<string,number> = $state({})
    function toggleSort(columnName:string)
    {
        sorts[columnName] = d.toggleSortColumn(columnName)
        getData()
    }

  

    // stuff for dealing with filtering
    let filterValue = $state("")
    function filter()
    {
        d.setFilter(filterValue, attributeNamesTypes)

        getData()
    }


    // stuff dealing with editing and updating
    let confirmYes = $state(()=>{})
    let open = $state(false)

    function remove(id:string)
    {
        open = true

        confirmYes = () =>
        {
            d.remove(id)
            .then(e=> 
                {
                    toast.success("Inventory Item deleted successfully!")
                    let index: number = items.findIndex((item) => item._id === id);
                    if (index !== -1) {
                    items.splice(index, 1);
                    }

                })
            .catch(e=> 
                {
                    toast.error(`Failed to delete inventory item: ${JSON.stringify(e)}`)
                }
            )

            open = false;
        }

    }

    function edit(id:string)
    {
        goto(`inventory/editInventoryItem?id=${id}`)
    }
  
  </script>


    <Confirm description={"Are You sure?"} yes={confirmYes} no={() => open = false} open={open}/>

        <Button href={`inventory/addInventoryItem?typeName=${d.typeName}`} class="w-fit self-end">+ Inventory Item</Button>

  <div class="flex items-center gap-10">
    <div class="flex items-center gap-4">
        <Input bind:value={filterValue}  name="filter" class=' w-36'/>
        <Button onclick={filter}>Filter</Button>
    </div>

    <div class="flex items-center gap-4">
        <Label class="text-lg">Inventory Type:</Label>
        <select bind:value={selectedType}  onchange={setTableType} class=" bg-white border-2 border-black rounded-sm min-w-28 p-1">
            {#each inventoryTypes as itemType }
            <option value={itemType.name}>{itemType.name}</option>
            {/each}
        </select>
    </div>
  </div>
  <Table.Root class="">

    <Table.Caption>{message}</Table.Caption>

    <Table.Header>
        <Table.Row>

            <Table.Head onclick={() => {toggleSort('description')}} class="hover:text-black cursor-pointer">
                Description
                {#if sorts['description'] == -1}
                    <UpArrow/>
                {:else if sorts['description'] == 1}
                    <DownArrow/>
                {/if}
            </Table.Head>
            <Table.Head onclick={() => {toggleSort('cost')}} class="hover:text-black cursor-pointer">
                Cost

                {#if sorts['cost'] == -1}
                    <UpArrow/>
                {:else if sorts['cost'] == 1}
                    <DownArrow/>
                {/if}
              </Table.Head>

            {#each attributeNamesTypes as attr}
                <Table.Head onclick={()=>{toggleSort(`attributes.${attr.attributeName}`)}}>
                    {attr.attributeName}
                    {#if sorts[`attributes.${attr.attributeName}`] == -1}
                        <UpArrow/>
                    {:else if sorts[`attributes.${attr.attributeName}`] == 1}
                        <DownArrow/>
                    {/if}
                </Table.Head>
            {/each}

            <Table.Head>
                Tools
            </Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each items as item}
            <Table.Row>
                <Table.Cell>{item.description}</Table.Cell>
                <Table.Cell>{item.cost}</Table.Cell>
                {#each attributeNamesTypes as attr}
                    <Table.Cell>{item.attributes[attr.attributeName]}</Table.Cell>
                {/each}

                <Table.Cell>
                    <div class="flex gap-2">
                        <button onclick={()=>remove(item._id)}>
                            <Garbage/>
                        </button>
                        <button onclick={()=>edit(item._id)}>
                            <Pencil class="text-lg"/>
                        </button>
                    </div>
                </Table.Cell>
                
            </Table.Row>
        {/each}
    </Table.Body>
  </Table.Root>

  {#if showPager}
  <Pagination.Root controlledPage count={d.total} perPage={10} page={d.page} onPageChange={(p) => {
    d.page = p;
    getData()
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
  {/if}