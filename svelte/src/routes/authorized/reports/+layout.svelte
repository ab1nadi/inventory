<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Menubar from "$lib/components/ui/menubar/index.js";


  let { children } = $props();

</script>

<div class="w-screen h-screen flex flex-col items-center">
    <div class="flex flex-col max-w-7xl w-full h-full">



{@render children()}


</div>
</div>