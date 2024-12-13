import {env} from '$env/dynamic/public' 
import { userSession } from '$lib/userSession/userSession.svelte'
/*
Using the api, this grabs a paged list off all data inventory elements.
using a filter, page, limit, and orderby
*/
export class AggregateDataFetcher 
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


    async get():Promise<InventoryItem[]>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/item?page=${this.page}&limit=${this.limit}&filter=${JSON.stringify(this.filter)}&orderBy=${JSON.stringify(this.orderBy)}&combineCost=true`, 
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


        console.log(data)


        return data.result
    }

}

export interface InventoryItem 
{
    _id:{
        typeName:string,
    },
    totalCost: string,
    totalItems: string,
    attributes: string[]
}