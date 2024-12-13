<script lang="ts">
    import TypeTable from "$lib/components/tables/typeTable.svelte";
    import Button from "$lib/components/ui/button/button.svelte";


</script>


<h1 class="text-2xl mt-4 mb-2">Inventory Types</h1>



<Button href="inventoryTypes/addInventoryType" class="w-fit self-end">+ Inventory Type</Button>
<TypeTable/>