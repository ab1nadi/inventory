<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";

    import { onMount } from "svelte";

    import Garbage from "$lib/icons/garbage.svelte";
    import { toast } from "svelte-sonner";

    import { page } from "$app/stores";

    import { TypeDataFetcher, type ItemType } from "$lib/inventory/type.svelte";
	import { goto } from "$app/navigation";
	import {  InventoryUpdater } from "$lib/inventory/inventory.svelte";


    let i_updater:InventoryUpdater = $state(new InventoryUpdater())
    let t_fetch:TypeDataFetcher = $state(new TypeDataFetcher(1))

    let itemType: ItemType = $state({_id:"", name:"", attributes:[]})

    // Access the query parameters
    const queryParams = $page.url.searchParams;
    // Example: Getting a specific query parameter by name
    const id = queryParams.get('id');


    onMount(()=> 
    {
        if(!id)
            toast.error("Inventory id hasn't been provided.")
        else 
        {
            i_updater.get(id)
            .then(async ()=>
            {
                t_fetch.filter={name: i_updater.inventoryItem.typeName}

                try
                {
                    itemType = (await t_fetch.get())[0]
                }
                catch(e)
                {
                    toast.error(`Something unforeseen happened: ${e}`)
                }

                console.log(itemType)
            })
            .catch(e=> 
            {
                toast.error(e.error)
            })
            
        }
    })


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


        i_updater.submit()
        .then(()=> {
            toast.success('Updated inventory item!')

            setTimeout(() => {
                goto(`/authorized/inventory/inventory?typeName=${i_updater.inventoryItem.typeName}`)
            }, 1500);
        })
        .catch(e=> {
            toast.error(`Failed to update inventory item: ${e}`)
        })

    }
</script>

<div class="flex justify-center w-full h-full">


<form onsubmit={submit} class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
    <h1 class=" text-xl">Editing An Inventory Item</h1>

    <div class="flex items-center gap-4">
        <Label class="text-lg text-nowrap">Inventory Type:</Label>
        <Input readonly bind:value={i_updater.inventoryItem.typeName}/>
    </div>

    <div>
        <Label>Description</Label>
        <Input  required  bind:value={i_updater.inventoryItem.description}/>
    </div>

    <div>
        <Label>Cost</Label>
        <Input  type="number" required bind:value={i_updater.inventoryItem.cost}/>
    </div>

    <div>
        <Label>Attributes</Label>
        <div class="ml-4 flex flex-col gap-3">
                {#each itemType.attributes as attrib}
                    <Label>{attrib.attributeName}</Label>
                    {#if attrib.dataType === "Number"}
                        <Input bind:value={i_updater.inventoryItem.attributes[attrib.attributeName]} required type="number"/>
                    {:else}
                        <Input bind:value={i_updater.inventoryItem.attributes[attrib.attributeName]} required />
                    {/if}
                {/each}
        </div>
    </div>



    <Button class="self-end" type="submit">submit</Button>

</form>

</div>