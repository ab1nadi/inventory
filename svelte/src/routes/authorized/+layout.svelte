<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
    import { userSession } from "$lib/userSession/userSession.svelte";
	import { onMount } from "svelte";
    let { children } = $props();


    import { Toaster } from "$lib/components/ui/sonner/index.js";
    
onMount(()=>
{
    if(browser && !userSession.loggedIn)
    {
        goto('/')
    }
})
</script>
<Toaster/>
<div>
{@render children()}
</div>