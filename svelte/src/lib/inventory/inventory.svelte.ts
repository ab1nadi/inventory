import {env} from '$env/dynamic/public' 
import { Filter } from './filter.svelte'
import { Sort } from './sort.svelte'
import { userSession } from '$lib/userSession/userSession.svelte'

/*
Using the api, this grabs a paged list off all data inventory elements.
using a filter, page, limit, and orderby
*/
export class InventoryDataFetcher 
{
    filter:Filter = new Filter()
    sort:Sort = new Sort()

    page:number = $state(1)
    limit:number= $state(0)
    total:number = $state(0)
    totalPages:number = $state(0)
    typeName:string = $state("")




    constructor(limit:number)
    {
        this.limit = limit
    }


    async remove(_id:string)
    {
        try 
        {
            let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item/${_id}`, 
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


    async get():Promise<InventoryItem[]>
    {

        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item?page=${this.page}&limit=${this.limit}&filter=${JSON.stringify(this.filter.getFilter())}&orderBy=${JSON.stringify(this.sort.getOrderBy())}`, 
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


        console.log(this.filter.getFilter())

        return data.result
    }


    setTypeName(typeName:string)
    {
        this.filter.setMustBeTrue('typeName',typeName)
        this.typeName = typeName
        this.filter.clearOr()
        this.sort = new Sort()
    }


    setFilter(filterValue:string, attributes:{attributeName:string, attributeType:string}[])
    {


        this.filter.clearOr()

        if(filterValue == "")
            return;

        this.filter.addOrRegexOptional('description', filterValue)

        if(!isNaN(parseFloat(filterValue)))
            this.filter.addOrNumberOptional('cost', parseFloat(filterValue))
        

        for(let attr of attributes)
        {
            if(attr.attributeType == 'string')
                this.filter.addOrRegexOptional(`attributes.${attr.attributeName}`, filterValue)

            else if(attr.attributeType == 'number')
                this.filter.addOrNumberOptional(`attributes.${attr.attributeName}`, parseFloat(filterValue))

        }

    }


    // returns 1 or -1 depending on ascending or descending
    toggleSortColumn(columnName:string)
    {
        return this.sort.toggleSort(columnName)
    }


}

export interface InventoryItem 
{
    _id:string
    typeName:string
    cost: string,
    description: string,
    attributes: Record<string, any>
}



export class InventoryCreator
{
    inventoryItem:InventoryItem = $state({_id:"", typeName:"", cost:"", description:"", attributes:{}})


    async submit()
    {        
        
        let attributes = Object.keys(this.inventoryItem.attributes).map((key)=> 
        {
            return {name:key, value: this.inventoryItem.attributes[key]}
        })

        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item`, 
            {
            method: 'POST', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
            body:JSON.stringify({
                "description": this.inventoryItem.description,
                "cost": this.inventoryItem.cost,
                "typeName": this.inventoryItem.typeName,
                "attributes": attributes
            })
          }
        )

        if (response.status != 200)
        {
            let error = await response.json()

            console.log(error)
            throw {error:`Problem grabbing type: ${error}`}
        }
            



        return response.json()

    }
}


export class InventoryUpdater
{
    inventoryItem:InventoryItem = $state({_id:"", typeName:"", cost:"", description:"", attributes:{}})


    async get(id:string)
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item/${id}`, 
            {
            method: 'GET', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }
          }
        )

        if (response.status != 200)
        {
            let error = await response.json()

            console.log(error)
            throw {error:`Problem fetching inventory item: ${JSON.stringify(error)}`}
        }

        this.inventoryItem = await response.json()

    }

    async submit()
    {        
        
        let attributes = Object.keys(this.inventoryItem.attributes).map((key)=> 
        {
            return {name:key, value: this.inventoryItem.attributes[key]}
        })

        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item/${this.inventoryItem._id}`, 
            {
            method: 'PUT', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
            }, 
            body:JSON.stringify({
                "description": this.inventoryItem.description,
                "cost": this.inventoryItem.cost,
                "typeName": this.inventoryItem.typeName,
                "attributes": attributes
            })
          }
        )

        if (response.status != 200)
        {
            let error = await response.json()

            console.log(error)
            throw {error:`Problem updating inventoryItem: ${JSON.stringify(error)}`}
        }
            



        return response.json()

    }
}