<script lang="ts">




    // UI components
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input";
    import UpArrow from "$lib/icons/upArrow.svelte";
    import DownArrow from "$lib/icons/downArrow.svelte";
    import Garbage from "$lib/icons/garbage.svelte";
    import ChartIcon from "$lib/icons/pageIcon.svelte";
    import Confirm from "../confirm.svelte";
    // Data fetcher and interface
    import { ReportStatusDataFetcher, type ReportStatus } from "$lib/reports/reportStatus.svelte";

    // Svelte imports
    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";


    let { reportName: givenReportName = '', update = $bindable() } = $props();

    

    update = () =>
    {
        getData()
    }

    let reports: ReportStatus[] = $state([])
    let d = new ReportStatusDataFetcher(10)

    let message = $state("")
    let showPager = $state(true)

    async function getData()
    {
        if(givenReportName != '')
        {
            d.setReportName(givenReportName)
        }

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


    function remove(_id:string)
    {
        open = true

        confirmYes = () =>
        {
            d.remove(_id)
            .then(e=> 
            {
                toast.success('Successfully deleted report')

                let removed_index = reports.findIndex(v=>v._id === _id)
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

    function goToResults(_id:string)
    {
        goto(`/authorized/reports/reportResults?_id=${_id}`)
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


    function formatDate(date:string)
    {
        let dateObject = new Date(date)

        const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const day = String(dateObject.getDate()).padStart(2, "0");
        const year = String(dateObject.getFullYear()).slice(-2); // Last 2 digits
        const hours = String(dateObject.getHours()).padStart(2, "0");
        const minutes = String(dateObject.getMinutes()).padStart(2, "0");

        // Combine into desired format
        return`${month}/${day}/${year} ${hours}:${minutes}`;

    }

</script>



<Confirm description={"Are You sure?"} yes={confirmYes} no={() => open = false} open={open}/>

<div class="flex items-center gap-4">
    <Input bind:value={filterValue} name="filter" class=' w-36'/>
    <Button onclick={filter}>Filter</Button>
  </div>
  <Table.Root class="">
    <Table.Header>
        <Table.Row>
            <Table.Head onclick={() => setSort("reportName")} class="hover:text-black cursor-pointer w-1/4">
                Report Name 
                {#if sort.reportName === -1}
                <UpArrow/>
                {/if}
                {#if sort.reportName === 1}
                <DownArrow/>
                {/if}
            </Table.Head>
            <Table.Head onclick={() => setSort("status")} class="hover:text-black w-2/4">
                Status
                {#if sort.status === -1}
                <UpArrow/>
                {/if}
                {#if sort.status === 1}
                <DownArrow/>
                {/if}
            
            </Table.Head>

            <Table.Head onclick={() => setSort("errorMessage")} class="hover:text-black w-2/4">
                Error Message
                {#if sort.errorMessage === -1}
                <UpArrow/>
                {/if}
                {#if sort.errorMessage === 1}
                <DownArrow/>
                {/if}
            
            </Table.Head>

            <Table.Head onclick={() => setSort("createdAt")} class="hover:text-black w-2/4">
                Run At
                {#if sort.createdAt === -1}
                <UpArrow/>
                {/if}
                {#if sort.createdAt === 1}
                <DownArrow/>
                {/if}
            
            </Table.Head>

            <Table.Head class="hover:text-black w-1/4">Tools</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each reports as report}
            <Table.Row>
                <Table.Cell class="font-medium">{report.reportName}</Table.Cell>
                <Table.Cell class="font-medium">{report.status}</Table.Cell>
                <Table.Cell class="font-medium">{report.errorMessage}</Table.Cell>
                <Table.Cell class="font-medium">{formatDate(report.createdAt)}</Table.Cell>
                <Table.Cell>
                    <div class="flex gap-2">
                        <button onclick={()=>remove(report._id)}>
                            <Garbage/>
                        </button>

                        <button onclick={()=>goToResults(report._id)} disabled={report.status !== "complete"}>
                            <ChartIcon/>
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
  