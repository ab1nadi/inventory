
import {env} from '$env/dynamic/public' 
import { browser } from '$app/environment'
class UserSession
{
    email:string =  $state("")
    password:string =  $state("")
    token:string = $state("")
    loggedIn:boolean = $state(false)


    // grab saved stuff if we can 
    constructor()
    {
        if(browser)
            this.grabSavedSession()


        // periodically check to update the token 
        if(this.loggedIn)
        {
            setTimeout(async ()=> 
            {
                console.log("Refreshing session token....")
                await this.grabSavedSession();
                console.log("Success")
            },1000)
        }
    }

    // sends email and password to the server
    // then grabs the token, and saves it to local storage
    async login():Promise<Boolean>
    {
        if(this.email == "" || this.password == "")
            throw "Email and password are required."

        // clear the password
        // save the email for later
        // save the token so that we can grab it later
        let response = await fetch(`${env.PUBLIC_API_URL}/auth`, {
            method: 'POST', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
            },
            body: JSON.stringify({email:this.email,password:this.password}), // Convert data to JSON string
          })



        if (response.status==200)
            this.token = (await response.json()).token;
        else 
            throw "Incorrect email or password"

        // save the stuff to the client

            localStorage.setItem("token", `bearer ${this.token}`)
            localStorage.setItem("email", `${this.email}`)

            this.loggedIn = true

        // done
        return true;

    }

    // attempts to grab a saved 
    async grabSavedSession ():Promise<boolean>
    {   

        let possibleToken = window.localStorage.getItem("token");
        this.token = possibleToken ? possibleToken : "";

        let possibleEmail = window.localStorage.getItem("email");
        this.email = possibleEmail ? possibleEmail : "";

        if(this.token == "")
            return false;

        // test the token 
        let response = await fetch(`${env.PUBLIC_API_URL}/checkToken`, {
            method: 'POST', // Specify the request method
            headers: {
              'Content-Type': 'application/json', // Specify content type
              'Authorization': `${this.token}`
            } // Convert data to JSON string
            ,body: JSON.stringify({email:this.email})
          })


        if (response.status == 200)
        {
            this.token = await response.json()
            this.loggedIn = true;
        }
        else 
            return false

        return true

    }


    logout()
    {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        this.email = ""
        this.password = ""
        this.token = ""
        this.loggedIn = false
    }


    getToken(): string
    {
        let token = localStorage.getItem("token")
        return token ? token : ""
    }
}

export let userSession = new UserSession()

