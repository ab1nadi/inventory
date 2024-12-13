import { userSession } from "$lib/userSession/userSession.svelte"
import {env} from '$env/dynamic/public' 


export interface ReportStatus 
{
    _id:string,
    status:string,
    errorMessage:string,
    createdAt:string,
    reportName:string,
}



// fetches a list of reports 
// uses the Report interface 
export class ReportStatusDataFetcher
{
    filter:object = $state({})
    sort:object = $state({createdAt: -1})

    page:number = $state(1)
    limit:number= $state(0)
    total:number = $state(0)
    totalPages:number = $state(0)

    reportName:string = $state("")


    constructor(limit: number)
    {
        this.limit = limit
    }


    // limits the data fetcher to a single kind of report
    setReportName(name:string)
    {
        this.reportName = name
    }



    async remove(_id: string)
    {
        try 
        {
            let response = await fetch(`${env.PUBLIC_API_URL}/authorized/reportResult/${_id}`, 
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

    async get():Promise<ReportStatus[]>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/reportResults?page=${this.page}&limit=${this.limit}&filter=${JSON.stringify(this.filter)}&orderBy=${JSON.stringify(this.sort)}&reportName=${this.reportName}`, 
        {
        method: 'GET', // Specify the request method
        headers: {
          'Content-Type': 'application/json', // Specify content type
          'Authorization': userSession.getToken()

        }})

        if(response.status != 200)
            throw `User session is probably bad. ${await response.text()}`
        

        let data: {page:number, totalPages:number, total:number, result:[]} = await response.json()

        this.totalPages = data.totalPages;
        this.total = data.total;


        return data.result


    }

}

