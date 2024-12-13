<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";

    import Garbage from "$lib/icons/garbage.svelte";
    import { toast } from "svelte-sonner";

    import { TypeCreator } from "$lib/inventory/type.svelte";
	import { goto } from "$app/navigation";

    let d = new TypeCreator()

    function addAttribute()
    {
        d.addAttribute() 
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

        d.submit().then(e=>
            {
                toast.success('Item Type Successfully Created')

                setTimeout(() => {
                    goto('/authorized/inventory/inventoryTypes')
                }, 500);
            }
        )
        .catch(e=>
            {
                toast.warning(e.error)
            }
        )
    }
</script>

<div class="flex justify-center w-full h-full">


<form onsubmit={submit} class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">

    <h1 class=" text-xl">Creating a New Inventory Type</h1>

    <div>
        <Label>Name</Label>
        <Input required bind:value={d.name}/>
    </div>

    <Button onclick={addAttribute}>Add Attribute</Button>
    <div class=" w-96 ml-10 min-h-10 bg-slate-300 rounded-sm p-3 flex flex-col gap-2">
        Attributes:
        {#each d.attributes as attrib}
            <div class="flex gap-2">
                <Input required placeholder="Attribute Name" class="bg-white" bind:value={attrib.attributeName}/>

                <select required bind:value={attrib.dataType} class="rounded-sm bg-white">
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                </select>
                <button type="button" onclick={()=>d.removeAttribute(attrib.attributeName)}>
                    <Garbage class="text-lg self-center cursor-pointer"/>
                </button>
            </div>
        {/each}
    </div>

    <Button class="self-end" type="submit">submit</Button>

</form>

</div>