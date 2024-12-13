<script lang="ts">
import { FetchFailedLogins, type FailedLogin } from "$lib/failedLogins.svelte";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
let failedLogins: FailedLogin[] = $state([])
let f = new FetchFailedLogins()


onMount(()=> 
{

    f.get().then((e) => failedLogins = e)
})

function clear()
{
  f.clear()
  .then(()=> 
    {
        toast.success("Cleared failed logins!")

        failedLogins = []
    }
  )
  .catch(e=> {
        toast.error(`Failed to clear failed logins: ${e.error}`)
  })
}

function formatDate(date:string)
{
    let dateObject = new Date(date)

    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(dateObject.getDate()).padStart(2, "0");
    const year = String(dateObject.getFullYear()).slice(-2); // Last 2 digits
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");

    // Combine into desired format
    return`${month}/${day}/${year} ${hours}:${minutes}`;

}

</script>

{#if failedLogins.length > 0}

    <h1>Failed Logins:</h1>
    <div class="overflow-scroll h-20 bg-white">
        {#each failedLogins as f}
        <div class="w-full border-black border-b-2 h-4 flex justify-center items-center">
            {formatDate(f.createdAt)}
        </div>
        {/each}
    </div>
    <button class="text-sm" onclick={clear}>Clear</button>

{/if}

