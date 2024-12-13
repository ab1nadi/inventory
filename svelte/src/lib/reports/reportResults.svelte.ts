import { userSession } from "$lib/userSession/userSession.svelte"
import {env} from '$env/dynamic/public' 


export interface ReportResult 
{
    _id:string,
    headers:[string],
    rows: [[string]],
    status:string,
    errorMessage:string,
    createdAt:string,
    reportName:string,
}



// fetches a list of reports 
// uses the Report interface 
export class ReportResultFetcher
{

    async get(_id:string):Promise<ReportResult>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/reportResult/${_id}`, 
        {
        method: 'GET', // Specify the request method
        headers: {
          'Content-Type': 'application/json', // Specify content type
          'Authorization': userSession.getToken()

        }})

        if(response.status != 200)
            throw `User session is probably bad. ${await response.text()}`

        return await response.json()
    }

}

