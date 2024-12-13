<script lang="ts">

    import { userSession } from "$lib/userSession/userSession.svelte";
    import { goto } from '$app/navigation';

    import * as Sidebar from "$lib/components/ui/sidebar/index.js"; 
	import { Trigger } from "./ui/dialog";
 



    // State for mobile menu toggle
    let showMobileMenu = $state(false);


    function logout()
    {
        userSession.logout();
        showMobileMenu = false;
        goto('/')
    }
  </script>
  
  <nav class="bg-gray-800 text-white px-4 h-12 shadow-md w-full flex items-center">
    <Sidebar.Trigger size="icon"></Sidebar.Trigger>

    <h2 class="self-center mx-auto"> NSSD Inventory</h2>
  </nav>


  