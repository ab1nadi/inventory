<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js"; 
	import MySideBar from "$lib/components/mySideBar.svelte";
	import '../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	let { children } = $props();

	let open = $state(false)
</script>

<Sidebar.Provider bind:open={open}>

	<MySideBar/>
	<div class="bg-background h-screen w-screen">
		<Navbar/>
		{@render children()}
	</div>

</Sidebar.Provider>