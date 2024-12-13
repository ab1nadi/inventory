<script lang="ts">
    import CodeEditor from "$lib/components/codeEditor.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { ReportUpdater } from "$lib/reports/reports.svelte";
	import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import Play from "$lib/icons/play.svelte";
    import Refresh from "$lib/icons/refresh.svelte";
    import { ReportRunner } from "$lib/reports/reports.svelte";



    import { page } from "$app/stores";
	import ReportStatuses from "$lib/components/tables/reportStatuses.svelte";

    // Access the query parameters
    const queryParams = $page.url.searchParams;

    // Example: Getting a specific query parameter by name
    const name = queryParams.get('name');
    let startCode = $state("")

    let rc = new ReportUpdater()


    let refresh = 0;

    let updateResults:Function;


    onMount(()=>
    {
        getData();
    })


    function getData()
    {
        if(!name)
            toast.error("Failed to find report")
        else
        {
            rc.get(name as string)
            .then(()=>
            {
                startCode = rc.code
            })
            .catch(e=> toast.error(`Issue grabbing report: ${e.error}`))
        }
    }

    function submit(event:Event)
        {
            event.preventDefault();
            event.stopPropagation();

            // Type guard to ensure the target is an HTMLFormElement
            const form = event.target as HTMLFormElement | null;
            if (!form) return;

            // Check if the form is valid
            if (!form.checkValidity()) {
                form.reportValidity(); // This will display any validation errors
                return;
            }

            rc.update()
            .then(e=> 
            {
                toast.success(`Successfully updated a report!`)


            })
            .catch(e=> 
            {
            toast.error(`Failed to update report: ${e.error}`)
            })
    }


    async function clearLogs()
    {
        
        rc.clearReportLogs()
        .then(()=> 
        {
            toast.success("Report logs have been cleared")
        })
        .catch(e=> 
        {
            toast.error(`Failed to clear logs: ${e.error}`)
        }
        )
    }


    async function testReport()
    {

        // update the report in the database
        try 
        {

            await rc.update()

            const form = document.getElementById('theReportForm') as HTMLFormElement | null;
            if (!form) return;

            // Check if the form is valid
            if (!form.checkValidity()) {
                form.reportValidity(); // This will display any validation errors
                return;
            }

            toast.success(`Successfully updated a report!`)


            await delay(500)

        }
        catch(e:any)
        {
            toast.error(`Failed to update report: ${e.error}`)
            return
        }

        // run the report 
        try 
        {

            let d = new ReportRunner(name as string)

             await d.run()

            toast.success("Report successfully started!")

        }
        catch(e:any)
        {
            toast.error(`Error running report: ${e.error}`)
        }


        
        
    }


    function delay(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
</script>

<div class="flex justify-center w-full h-full">


  <form id="theReportForm" onsubmit={submit} class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
  
        <div class="w-full h-full flex flex-col gap-3 mt-4">
        <h1 class=" text-2xl">Updating/Running Report: {rc.name}</h1>

        <div class="flex flex-col gap-1">
            <Label class="text-lg">Report Name:</Label>
            <Input bind:value={rc.name} disabled/>
        </div>

        <div class="flex flex-col gap-1 w-full">
            <Label class="text-lg">Description:</Label>
            <Textarea bind:value={rc.description} required/>
        </div>
        <div class="w-full h-96">
            <CodeEditor bind:value={rc.code} />
        </div>

        <div class="flex w-full gap-2">
            <Button type="submit" >Update</Button>
            <Button onclick={testReport}><Play/></Button>
        </div>
        </div>
        <div class="w-full h-full flex flex-col gap-3 mt-4">

     
            <h1 class=" text-2xl border-b-black border-dotted border-b-2">Report Logs:</h1>
            <div class="w-full gap-2 flex">
                <Button onclick={clearLogs}>Clear Logs</Button>
                <Button onclick={getData}><Refresh/></Button>
            </div>
            <div class="border-black border-2  w-full h-32 overflow-scroll p-2">
                {#each rc.custom_logs as log, i}
                    <div>{i}. {log}</div>
                {/each}
            </div>

        </div>
      


        <div class="w-full h-full flex flex-col gap-3 mt-4">

        
            <h1 class="text-2xl border-b-2 border-b-black border-dotted ">Report Results:</h1>

            <div class="w-full gap-2 flex">
                <Button onclick={()=> updateResults()}><Refresh/></Button>
            </div>

            {#key refresh}
                <ReportStatuses bind:update={updateResults}  reportName={name as string} />
            {/key}

        </div>
  </form>


</div>

