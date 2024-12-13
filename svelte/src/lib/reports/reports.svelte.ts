import { userSession } from "$lib/userSession/userSession.svelte"
import {env} from '$env/dynamic/public' 


export interface Report 
{
    _id:string
    name:string
    description: string
    code: string
    custom_logs: [string]
}

// creates a single report
export class ReportCreator
{
    name = $state("")
    description = $state("")
    code = $state("")


    async create()
    {


        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/report`, 
            {
            method: 'POST', // Specify the request method
            headers: {
            'Content-Type': 'application/json', // Specify content type
            'Authorization': userSession.getToken()
            },
            body: JSON.stringify({
                "name": this.name,
                "description": this.description,
                "code": this.code
            })
            })

        if (response.status != 200)
            {
                let error = await response.json()

                console.log(error)
    
                throw error
            }

        return await response.json()

    }
}


// updates a report
// self explanatory af
export class ReportUpdater
{
    name:string = $state("")
    description:string = $state("")
    code:string = $state("")
    custom_logs:string[] = $state([])

    // grabs the original values 
    // given a report name
    async get(name:string)
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/report/${name}`, 
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
    
                throw {error:`Problem fetching report: ${JSON.stringify(error)}`}
            }
    
            let gotten = await response.json()

            this.name = gotten["name"]
            this.description = gotten["description"]
            this.code = gotten["code"]
            this.custom_logs = gotten["custom_logs"]
    }


    async update()
    {


        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/report/${this.name}`, 
            {
            method: 'PUT', // Specify the request method
            headers: {
            'Content-Type': 'application/json', // Specify content type
            'Authorization': userSession.getToken()
            },
            body: JSON.stringify({
                "description": this.description,
                "code": this.code
            })
            })

        if (response.status != 200)
            {
                let error = await response.json()
    
                throw error
            }

        return await response.json()

    }


    async clearReportLogs():Promise<void>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/clearReportLogs/${this.name}`, 
            {
            method: 'DELETE', // Specify the request method
            headers: {
            'Content-Type': 'application/json', // Specify content type
            'Authorization': userSession.getToken()
            }})


        if (response.status != 200)
        {
            let error = await response.text()
            throw {error:error}
        }

        this.custom_logs = []
        
    }

}


// fetches a list of reports 
// uses the Report interface 
export class ReportDataFetch
{
    filter:object = $state({})
    sort:object = $state({createdAt: -1})

    page:number = $state(1)
    limit:number= $state(0)
    total:number = $state(0)
    totalPages:number = $state(0)


    constructor(limit: number)
    {
        this.limit = limit

    }



    async remove(name: string)
    {
        try 
        {
            let response = await fetch(`${env.PUBLIC_API_URL}/authorized/report/${name}`, 
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

    async get():Promise<Report[]>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/report?page=${this.page}&limit=${this.limit}&filter=${JSON.stringify(this.filter)}&orderBy=${JSON.stringify(this.sort)}`, 
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

// runs a report given an id
export class ReportRunner 
{
    reportName:string;
    constructor(reportName:string)
    {
        this.reportName = reportName
    }

    async run():Promise<void>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/runreport/${this.reportName}`, 
        {
        method: 'POST', // Specify the request method
        headers: {
          'Content-Type': 'application/json', // Specify content type
          'Authorization': userSession.getToken()

        }})

        if(response.status != 200)
            throw `User session is probably bad. ${await response.text()}`
        
    }
}
