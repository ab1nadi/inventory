import {env} from '$env/dynamic/public' 
import { userSession } from '$lib/userSession/userSession.svelte'
/*
Using the api, this grabs a paged list off all data inventory elements.
using a filter, page, limit, and orderby
*/
export class TypeDataFetcher 
{
    filter:object = $state({})
    orderBy:object = $state({createdAt: -1})
    page:number = $state(1)
    limit:number= $state(0)
    total:number = $state(0)
    totalPages:number = $state(0)

    constructor(limit:number)
    {
        this.limit = limit
    }


    async remove(name:string)
    {
        try 
        {
            let response = await fetch(`${env.PUBLIC_API_URL}/authorized/itemType/${name}`, 
            {
            method: 'DELETE', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
            })

            if(response.status != 200)
                throw await response.json()

            return true
        }
        catch(e)
        {
            throw e
        }
    }


    async get():Promise<ItemType[]>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/itemType?page=${this.page}&limit=${this.limit}&filter=${JSON.stringify(this.filter)}&orderBy=${JSON.stringify(this.orderBy)}`, 
            {
            method: 'GET', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
          }
        )

        if(response.status != 200)
            throw "User session is probably bad."


        let data: {page:number, totalPages:number, total:number, result:[]} = await response.json()

        this.totalPages = data.totalPages;
        this.total = data.total;


        return data.result
    }

}

export interface attributeType
{
    attributeName: string,
    dataType: string,
    typeReadOnly?:boolean
}

export interface ItemType 
{
    _id:string,
    name:string,
    attributes: attributeType[]
}

/*
Using the api creates a new type
*/
export class TypeCreator
{
    name:string = $state("")
    attributes:attributeType[] = $state([])

    // returns a index into attributes the attribute in the array
    addAttribute()
    {
        this.attributes.push({attributeName:"", dataType:"String"})
        return this.attributes.length
    }

    removeAttribute(name:String)
    {
        const index = this.attributes.findIndex(item => item.attributeName === name)
        this.attributes.splice(index,1)
    }


     async submit()
    {
        // make sure stuff is where it should be 
        if(this.name == "")
            throw {error: "Item name must be set"}

        for(let attrib of this.attributes)
            if(attrib.attributeName == "")
                throw {error: "Please don't leave empty attribute names"}

        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/itemType`, 
            {
            method: 'POST', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
            body:JSON.stringify({
              "name": this.name,
              "attributes": this.attributes  
            })
          }
        )

        if(response.status != 200)
            throw {error: (await response.json()).error, status: response.status}
        return true;
    }
}




export class TypeUpdater
{
    name:string = $state("")

    // if old is empty we are creating a new attribute, if new is empty we are deleting an attribute
    // if they are the same nothing has changed, if something has changed update it to the new one.
    attributes:Array<{old: attributeType|null, new: attributeType|null}> = $state([])


    inventoryItemCount:number = $state(0);


    // grabs the inventory type attributes from the server
    constructor(name:string)
    {
        this.name = name
    }

    // grabs the inventory attributes from the server
    async get()
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/itemType/${this.name}`, 
        {
            method: 'GET', // Specify the request method
            headers: {
            'Content-Type': 'application/json', // Specify content type
            'Authorization': userSession.getToken()
            }, 
        })

        if (response.status != 200)
            throw {error:`Problem grabbing type: ${(await response.json())}`}

        let data = await response.json()

        this.attributes = data.attributes.map((attr:attributeType) => { attr.typeReadOnly=true; return {old:attr, new:attr}})
                
    }

    async count()
    {
        console.log(this.name)
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item/count/${this.name}`, 
        {
            method: 'GET', // Specify the request method
            headers: {
            'Content-Type': 'application/json', // Specify content type
            'Authorization': userSession.getToken()
            }, 
        })

        this.inventoryItemCount = await response.json()

        console.log(this.inventoryItemCount)
    }


    // returns a index into attributes the attribute in the array
    addAttribute()
    {
        this.attributes.push({old:null, new:{attributeName:"", dataType:"String"}})
        return this.attributes.length
    }

    removeAttribute(attribute:attributeType)
    {
        const index = this.attributes.findIndex(item => 
        {
            if(item.new?.attributeName === attribute.attributeName)
                return item
        })


        this.attributes[index].new = null


        if(this.attributes[index].new == null && this.attributes[index].old == null)
            this.attributes.splice(index,1)
    }


     async submit()
    {
        // make sure stuff is where it should be 
        if(this.name == "")
            throw {error: "Item name must be set"}


        console.log(this.attributes)

        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/itemType/extended/${this.name}`, 
            {
            method: 'PUT', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
            body:JSON.stringify({
              "name": this.name,
              "attributes": this.attributes  
            })
          }
        )

        if(response.status != 200)
            console.log({error: (await response.json()), status: response.status})

        console.log(JSON.stringify(await response.json()))
        return true;
    }
}



