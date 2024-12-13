<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import Button from "./ui/button/button.svelte";
    let {description = "This could be a destructive action.", open = false, yes, no}: {description:string, open: boolean, yes:()=>void, no:()=>void} = $props()
</script>


<Dialog.Root bind:open={open} onOpenChange={(op)=> 
  {
    if(op == false)
      no();
  }}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Are you sure?</Dialog.Title>
        <Dialog.Description>
          {description}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <div>
            <Button onclick={yes}>Yes</Button>
            <Button onclick={no}>No</Button>
        </div>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>