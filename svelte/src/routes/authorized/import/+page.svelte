<script lang="ts">
    import { onMount } from "svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
	import { TypeDataFetcher, type ItemType, type attributeType} from "$lib/inventory/type.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { InventoryImporter } from "$lib/imports.svelte";

    import Info from "$lib/icons/info.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";


    let selectedType:ItemType = $state({
        _id: "",
        name:"",
        description: "",
        attributes: []
    })

    let inventoryTypes:ItemType[] = $state([])

    let typeFetcher:TypeDataFetcher = new TypeDataFetcher(100000)

    let importer:InventoryImporter = new InventoryImporter();


    onMount(()=> 
    {
        typeFetcher.get()
        .then(types=> 
            {   
                inventoryTypes= types;
                selectedType = inventoryTypes[0]
                importer.setInventoryType(inventoryTypes[0])
            }   
        )
    })

</script>

<div class="flex flex-col items-center w-full h-full">


    <div class="max-w-4xl w-full h-fit flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
    
        <h1 class=" text-xl">Import into an inventory type</h1>
        
 


        <div class="flex  items-center gap-4">
            <Label class="text-lg">Inventory Type:</Label>
            <select bind:value={selectedType} onchange={()=>importer.setInventoryType(selectedType)}  class=" bg-white border-2 border-black rounded-sm min-w-28 p-1">
                {#each inventoryTypes as itemType }
                    <option value={itemType}>{itemType.name}</option>
                {/each}
            </select>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Info/>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>To import an inventory type that doesn't exist yet, you have to create the type in the inventory types menu.</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>



        <div>
            <div>Expected columns in csv:</div>

            <div class="flex gap-2">
                <Badge>cost</Badge>
                <Badge>description</Badge>
                {#each selectedType.attributes as attrib}
                    <Badge>{attrib.attributeName}</Badge>
                {/each}
            </div>
        </div>


        <div>
            <Label>Import File:</Label>
            <Input onchange={(e)=>{
                const input = e.target as HTMLInputElement
                importer.setImportFile(input.files?.[0])
            }} type="file" id="csvInput" accept=".csv" >
            </Input>
        </div>


        {#if importer.importFile != null && importer.inventoryType != null}
            <div class="w-full flex justify-end">
                <Button onclick={()=>importer.import()}>Import File</Button>
            </div>
        {/if}
    </div>



    {#if importer.importResults.length > 0}
        <div class="max-w-4xl w-full h-96 overflow-scroll flex flex-col items-start border-black border-2 gap-6 p-3 mt-3 rounded-lg">
            {#each importer.importResults as result}
                {#if result.error}
                    <div class="text-red-600 text-sm">
                        {result.message}
                    </div>
                {:else}
                    <div class="text-sm">
                        {result.message}
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
