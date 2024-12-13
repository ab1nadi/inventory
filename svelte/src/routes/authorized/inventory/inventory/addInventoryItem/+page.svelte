<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";

    import { onMount } from "svelte";

    import Garbage from "$lib/icons/garbage.svelte";
    import { toast } from "svelte-sonner";
    import { page } from "$app/stores";

    import { TypeCreator } from "$lib/inventory/type.svelte";
	import { goto } from "$app/navigation";
    import { TypeDataFetcher, type ItemType } from "$lib/inventory/type.svelte";
	import { InventoryCreator } from "$lib/inventory/inventory.svelte";



    // Access the query parameters
    const queryParams = $page.url.searchParams;
    // Example: Getting a specific query parameter by name
    const typeName = queryParams.get('typeName');


    let t_fetch = new TypeDataFetcher(100000);
    let inventoryTypes:ItemType[] = $state([]);
    let selectedType:ItemType = $state({_id:"", name:"", attributes:[]})

    let i_creator = new InventoryCreator()

    // updates the i_creator typeName
    function selectedTypeChanged()
    {
        i_creator.inventoryItem.typeName=selectedType.name
    }

    onMount(async ()=>
    {
        // get all possible inventory types
        inventoryTypes = await t_fetch.get()

        let foundType:ItemType|undefined = undefined;


        if(typeName)
           foundType = inventoryTypes.find(item=> item.name == typeName)

        if(foundType)
        {
            selectedType = foundType
            i_creator.inventoryItem.typeName = foundType.name
        }
        else {
            selectedType = inventoryTypes[0]
            i_creator.inventoryItem.typeName = selectedType.name
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


        i_creator.submit()
        .then(r=> {
            toast.success('Created inventory item!')

            setTimeout(() => {
                goto(`/authorized/inventory/inventory?typeName=${i_creator.inventoryItem.typeName}`)
            }, 1500);
        })
        .catch(e=> {
            toast.error(`Failed to create inventory item: ${JSON.stringify(e)}`)
        })
        

    }
</script>

<div class="flex justify-center w-full h-full">


<form onsubmit={submit} class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
    <h1 class=" text-xl">Creating a New Inventory Item</h1>

    <div class="flex items-center gap-4">
        <Label class="text-lg">Inventory Type:</Label>
        <select bind:value={selectedType} onchange={selectedTypeChanged} class=" bg-white border-2 border-black rounded-sm min-w-28 p-1">
            {#each inventoryTypes as itemType }
                <option value={itemType}>{itemType.name}</option>
            {/each}
        </select>
    </div>

    <div>
        <Label>Description</Label>
        <Input bind:value={i_creator.inventoryItem.description} required />
    </div>

    <div>
        <Label>Cost</Label>
        <Input bind:value={i_creator.inventoryItem.cost} type="number" required />
    </div>

    <div>
        <Label>Attributes</Label>
        <div class="ml-4 flex flex-col gap-3">
            {#each selectedType.attributes as attrib}
                <div class="flex items-center gap-3">
                    <Label>{attrib.attributeName}</Label>
                    {#if attrib.dataType == "Number"}
                        <Input bind:value={i_creator.inventoryItem.attributes[attrib.attributeName]} required type="number"/>
                    {:else}
                        <Input bind:value={i_creator.inventoryItem.attributes[attrib.attributeName]} required />
                    {/if}
                    <div>({attrib.dataType})</div>
                </div>
            {/each}
        </div>
    </div>



    <Button class="self-end" type="submit">submit</Button>

</form>

</div>