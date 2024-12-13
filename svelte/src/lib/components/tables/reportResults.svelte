<script lang="ts">

    import { page } from "$app/stores";

    // Access the query parameters
    const queryParams = $page.url.searchParams;

    // Example: Getting a specific query parameter by name
    const _id = queryParams.get('_id');

    // UI components
    import * as Table from "$lib/components/ui/table";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input";
    import UpArrow from "$lib/icons/upArrow.svelte";
    import DownArrow from "$lib/icons/downArrow.svelte";

    // Data fetcher and interface
    import { ReportResultFetcher, type ReportResult } from "$lib/reports/reportResults.svelte";
    // Svelte imports
    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
    

    let reportResult: ReportResult = $state({
        _id:"",
        headers:[""],
        rows: [[""]],
        status:"",
        errorMessage:"",
        createdAt:"",
        reportName:"",
    });
    let d = new ReportResultFetcher

    onMount(()=>
    {
        d.get(_id as string).then(e=> 
            {
                reportResult = e;
            }
        )
    })

    let message = $state("")
    let showPager = $state(true)

</script>

<h1 class="text-2xl mt-4 mb-2">Report Results: {reportResult.reportName}</h1>

<div class="flex items-center gap-4">
    <Input  name="filter" class=' w-36'/>
    <Button>Filter</Button>
  </div>
  <Table.Root class="">
    <Table.Header>
        <Table.Row>
            {#each reportResult.headers as head}
                <Table.Head>{head}</Table.Head>
            {/each}
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each reportResult.rows as row}
            <Table.Row>
                {#each row as item}
                    <Table.Cell>{item}</Table.Cell>
                {/each}
            </Table.Row>
        {/each}
    </Table.Body>
  </Table.Root>
  
  