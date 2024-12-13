<script lang="ts">

    // TODO: FIX the modification of types, and types need to be enforced for all 
    // inventory items
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";

    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { TypeUpdater } from "$lib/inventory/type.svelte";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";

    import Garbage from "$lib/icons/garbage.svelte";

    // Access the query parameters
    const queryParams = $page.url.searchParams;
    // Example: Getting a specific query parameter by name
    const typeName = queryParams.get('typeName');

    let d: TypeUpdater = new TypeUpdater('')

    onMount(()=> 
    {
        if(!typeName)
            toast.error("Inventory Type Name hasn't been provided.")
        else 
        {
            d = new TypeUpdater(typeName as string)
            d.get()
            d.count()
        }
    })


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
                toast.success('Item Type Successfully Updated')

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
    
        <h1 class=" text-xl">Updating An Inventory Type</h1>
        <h1>Number of inventory items that use this type: {d.inventoryItemCount}</h1>
        <div>
            <Label>Name</Label>
            <Input required bind:value={d.name} readonly />
        </div>
    
        <Button onclick={addAttribute}>Add Attribute</Button>
        <div class=" w-96 ml-10 min-h-10 bg-slate-300 rounded-sm p-3 flex flex-col gap-2">
            Attributes:

                {#each d.attributes as attrib}

                    {#if attrib.new != null}
                        <div class="flex gap-2">
                            <Input required placeholder="Attribute Name" class="bg-white" bind:value={attrib.new.attributeName}/>
            
                            {#if attrib.new.typeReadOnly}
                                <select data-original={attrib.new.dataType} required bind:value={attrib.new.dataType} class="rounded-sm bg-white">
                                    <option value={attrib.new.dataType}>{attrib.new.dataType}</option>
                                </select>
                            {:else}
                                <select data-original={attrib.new.dataType} required bind:value={attrib.new.dataType} class="rounded-sm bg-white">
                                    <option value="String">String</option>
                                    <option value="Number">Number</option>
                                </select>
                            {/if}

                            <button type="button" onclick={()=>
                            {
                                if(attrib.new != null)
                                    d.removeAttribute(attrib.new)
                            }
                            }>
                                <Garbage class="text-lg self-center cursor-pointer"/>
                            </button>
                        </div>
                    {/if}
                {/each}
        </div>
    
        <Button class="self-end" type="submit">submit</Button>
    
    </form>
    
    </div>