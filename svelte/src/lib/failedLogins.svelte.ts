import { userSession } from "$lib/userSession/userSession.svelte"
import {env} from '$env/dynamic/public' 

export interface FailedLogin 
{
    createdAt:string
}

export class FetchFailedLogins
{

    async clear():Promise<void>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/failedLogins`, 
            {
            method: 'DELETE', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': userSession.getToken()
    
            }})
    
            if(response.status != 200)
                throw `User session is probably bad. ${await response.text()}`
    
            return await response.json()
    }

    async get():Promise<FailedLogin[]>
    {
        let response = await fetch(`${env.PUBLIC_API_URL}/authorized/failedLogins`, 
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