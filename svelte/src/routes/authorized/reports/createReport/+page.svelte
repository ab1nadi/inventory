<script lang="ts">
	import { goto } from "$app/navigation";
	import CodeEditor from "$lib/components/codeEditor.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { ReportCreator } from "$lib/reports/reports.svelte";
  import { toast } from "svelte-sonner";

  let rc = new ReportCreator()

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

        rc.create()
        .then(e=> 
        {
          toast.success(`Successfully created a report!`)

          setTimeout(() => {
            goto('/authorized/reports/reports')
          }, 300);
        })
        .catch(e=> 
        {
          toast.error(`Failed to create report: ${e.error}`)
        })
  }

</script>

<div class="flex justify-center w-full h-full">


  <form onsubmit={submit} class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
  
      <h1 class=" text-xl">Creating a Report</h1>

      <div class="flex flex-col gap-1">
        <Label class="text-lg">Report Name:</Label>
        <Input bind:value={rc.name} required/>
      </div>

      <div class="flex flex-col gap-1 w-full">
        <Label class="text-lg">Description:</Label>
        <Textarea bind:value={rc.description} required/>
      </div>
      <div class="w-full h-96">
        <CodeEditor bind:value={rc.code}/>
      </div>

      <Button type="submit" class="place-self-end">Submit</Button>
  </form>

</div>

