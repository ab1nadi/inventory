<script lang="ts">

    // UI components
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input";
    import UpArrow from "$lib/icons/upArrow.svelte";
    import DownArrow from "$lib/icons/downArrow.svelte";
    import Garbage from "$lib/icons/garbage.svelte";
    import Pencil from "$lib/icons/pencil.svelte";
    import Play from "$lib/icons/play.svelte";
    import Confirm from "../confirm.svelte";

    // Data fetcher and interface
    import { ReportDataFetch, ReportRunner, type Report } from "$lib/reports/reports.svelte";

    // Svelte imports
    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
    

    let reports: Report[] = $state([])
    let d = new ReportDataFetch(10)

    let message = $state("")
    let showPager = $state(true)

    async function getData()
    {
        let gotten = await d.get()
        reports = gotten;


        if(reports.length == 0)
        {
            message = `No reports`
            showPager = false
        }
        else 
        {
            message = ""
            showPager = true
        }
    }

    onMount(async ()=> 
    {
        getData()
    })


    let confirmYes = $state(()=>{})
    let open = $state(false)


    function remove(name:string)
    {
        open = true

        confirmYes = () =>
        {
            d.remove(name)
            .then(e=> 
            {
                toast.success('Successfully deleted report')

                let removed_index = reports.findIndex(v=>v.name === name)
                reports.splice(removed_index, 1)
            }
            )
            .catch(e=> 
            {
                toast.error(`failed to delete report: ${e.error}`)
            }
            )
            open = false

        }

    }

    function edit(name:string)
    {
        goto(`/authorized/reports/editReport?name=${name}`)
    }


    function runReport(name:string)
    {
        let d = new ReportRunner(name)

        d.run()
        .then(()=> 
        {
            toast.success("Report successfully started!")
        })
        .catch((e)=> 
        {
            toast.error(`Error running report: ${e.error}`)
        });
    }



    // Initialize sort with default values
    let sort: Record<string, number> = $state({})

    // Function to set sorting options
    function setSort(field: string) {

        console.log(sort)
  
        if (sort[field] === undefined) {
            sort[field] = 1; // Set to ascending
        } else if (sort[field] === 1) {
            sort[field] = -1; // Set to descending
        } else {
            sort[field] = 1; // Reset to undefined
        }

        d.page = 1 // reset the page

        d.sort = sort; // Assign the sort object to the fetcher


        getData()
    }


    let filterValue = $state("")
  
    function filter()
    {

        d.filter = {"description": filterValue, "name": filterValue}

        getData()
    }

</script>



<Confirm description={"Are You sure?"} yes={confirmYes} no={() => open = false} open={open}/>


<Button href={`/authorized/reports/createReport`} class="w-fit self-end">+ Report</Button>
<div class="flex items-center gap-4">
    <Input bind:value={filterValue} name="filter" class=' w-36'/>
    <Button onclick={filter}>Filter</Button>
  </div>
  <Table.Root class="">
    <Table.Header>
        <Table.Row>
            <Table.Head onclick={() => setSort("name")} class="hover:text-black cursor-pointer w-1/4">
                Type Name 
                {#if sort.name === -1}
                <UpArrow/>
                {/if}
                {#if sort.name === 1}
                <DownArrow/>
                {/if}
            </Table.Head>
            <Table.Head onclick={() => setSort("description")} class="hover:text-black w-2/4">
                Description
                {#if sort.description === -1}
                <UpArrow/>
                {/if}
                {#if sort.description === 1}
                <DownArrow/>
                {/if}
            
            </Table.Head>

            <Table.Head class="hover:text-black w-1/4">Tools</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each reports as report}
            <Table.Row>
                <Table.Cell class="font-medium">{report.name}</Table.Cell>
                <Table.Cell class="font-medium">{report.description}</Table.Cell>

                <Table.Cell>
                    <div class="flex gap-2">
                        <button onclick={()=>remove(report.name)}>
                            <Garbage/>
                        </button>
                        <button onclick={()=>edit(report.name)}>
                            <Pencil class="text-lg"/>
                        </button>
                        <button  onclick={()=>runReport(report.name)} >
                            <Play class="text-lg hover:text-slate-500"/>
                        </button>
                    </div>
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
  </Table.Root>
  
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
  