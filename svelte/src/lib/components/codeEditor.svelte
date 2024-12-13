<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { browser } from '$app/environment';

    let {value = $bindable('')} = $props();

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;

	let notSet = true;



	if(browser)
	onMount(async () => {
		// Import our 'monaco.ts' file here
		// (onMount() will only be executed in the browser, which is what we want)
		monaco = (await import('$lib/monaco/monaco')).default;

		// Your monaco instance is ready, let's display some code!
		 editor = monaco.editor.create(editorContainer, {theme: "vs-dark"});
		const model = monaco.editor.createModel(
			'// Your code here....',
			'javascript'
		);
		editor.setModel(model);
		
		editor.onDidChangeModelContent(()=> {value = editor.getValue()})


		if(value && editor && notSet)
		{
			editor.setValue(value)
			notSet = false

			if(value == "")
				value = editor.getValue()
		}

		


	});

	$effect(()=> 
	{
		if(value && editor && notSet)
		{
			editor.setValue(value)
			notSet = false
		}	

		if(value == "" && editor)
			value = editor.getValue()
	})

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});
</script>


<div class="w-full h-full border-black border-2" bind:this={editorContainer}></div>
