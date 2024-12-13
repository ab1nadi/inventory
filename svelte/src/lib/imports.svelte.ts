import { userSession } from "./userSession/userSession.svelte";
import { type ItemType, type attributeType } from "./inventory/type.svelte";
import csv from 'csvtojson'

import { InventoryCreator } from "./inventory/inventory.svelte";
import { json } from "@sveltejs/kit";

export interface ImportResult 
{
    error:Boolean,  // error=True means the message is an error
    message:String
}

export class InventoryImporter
{
    importResults:ImportResult[] = $state([])
    inventoryType:ItemType|undefined;
    importFile:File|undefined = $state();
    

    setInventoryType(type:ItemType)
    {
        this.inventoryType = type;
    }

    setImportFile(file:File|undefined)
    {
        this.importFile = file;
    }


    async import(): Promise<void>
    {
        if(this.inventoryType == undefined || this.importFile == undefined)
            throw {error: "Cannot import if inventoryType isn't selected or importFile not given."}
        else 
        {

            // convert the file to json 
            let fileText:string = await this.readFileAsText(this.importFile)
            let jsonData = await csv().fromString(fileText)


            for (let i = 0; i<jsonData.length; i++)
            {
                let row = jsonData[i]
                try 
                {
                    let creator = new InventoryCreator()

                    creator.inventoryItem.typeName = this.inventoryType.name

                    creator.inventoryItem.cost = row['cost']
                    
                    creator.inventoryItem.description = row['description']

                    for (let attrib of this.inventoryType.attributes)
                        if (attrib.attributeName in row)
                            creator.inventoryItem.attributes[attrib.attributeName] = row[attrib.attributeName]
                        else
                            throw `"column ${attrib.attributeName} doesn't exist"`

                    await creator.submit()

                    this.importResults.push({error:false, message:`${i}. Successful imported.`})

                }
                catch(e)
                {
                    this.importResults.push({error:true, message:`${i}. Failed to import ${e}`})
                }
            }
        }
    }


    readFileAsText(file:File):Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
    
          reader.onload = () => resolve(reader.result as string); // Resolve with the file content as a string
          reader.onerror = (error) => reject(error); // Reject if an error occurs
    
          reader.readAsText(file); // Read the file as text
        });
      }
}