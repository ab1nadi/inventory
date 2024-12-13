<script lang="ts">
    import { browser } from "$app/environment";

    import {Button} from "$lib/components/ui/button"
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import { goto } from '$app/navigation';
    
    import { onMount } from "svelte";

    import { userSession } from "$lib/userSession/userSession.svelte";

    let loginError = $state("")

    onMount(()=> 
    {
        userSession.grabSavedSession().then(loggedIn => 
            {
                if(loggedIn)
                    goto('/authorized/inventory/inventory')
            }
        )
    })

    function login()
    {
        if (userSession.email == '' || userSession.password == '')
        {
            return;
        }


        if(browser)
        userSession.login()
        .then(()=> goto('/authorized/inventory/inventory'))
        .catch(()=> {loginError = "Email or password is incorrect."; console.log("what the freak")})
    }

</script>


<div class=" flex flex-col h-full items-center w-full pt-36 gap-10">

<div class="text-3xl">NSSD Inventory</div>

<Card.Root class="w-[350px]">
    <Card.Header>
        <Card.Title>Login</Card.Title>
    </Card.Header>
    <Card.Content>
        <Input type="email"  bind:value={userSession.email} placeholder="email" class="max-w-xs"/>
        <Input type="password"   bind:value={userSession.password} placeholder="password" class="max-w-xs mt-5"/>
        <div class="h-9 mt-5">
            {#if loginError != ""}
                <p class="text-red-600">{loginError}</p>
            {:else}
                <div>Need <a class="text-stone-300 hover:text-black" href="/help">help</a> logging in?</div>
            {/if}
        </div>
    </Card.Content>
    <Card.Footer>
        <Button  onclick={login}>Login</Button>

    </Card.Footer>
</Card.Root>

</div>