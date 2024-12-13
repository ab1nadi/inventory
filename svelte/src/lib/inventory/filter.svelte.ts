/*
A class that essentially turns into a mongoose filter
*/
export class Filter 
{

    mustBeTrue:Record<string,any> = $state({})

    anyTrue:Record<string,any>[] = $state([])


    /*
    When something must always be true
    */
    setMustBeTrue(key:string,value:string)
    {
        this.mustBeTrue[key] = value;
    }
    

    /*
    Used with exact matches
    */
    addOrOptional(key:string,value:string)
    {
        let obj:Record<string,any> = {}
        obj[key] = value;
        this.anyTrue.push(obj)
    }

    /*
    Used with filtering so that it can match part of a word
    */
    addOrRegexOptional(key:string,value:string)
    {
        let obj:Record<string,any> = {}

        obj[key] = {
            $regex: value, $options: 'i'
        }

        this.anyTrue.push(obj)
    }

    addOrNumberOptional(key:string,value:number)
    {
        let obj:Record<string,any> = {}

        obj[key] = {
            $gte:value
        }

        this.anyTrue.push(obj)
    }

    /*
    Clear the Or
    */
    clearOr()
    {
        this.anyTrue = []
    }


    getFilter()
    {

        let returned = 
        {
            $and: [
                this.mustBeTrue,
            ]
        }  
        
        if (this.anyTrue.length != 0)
            returned.$and.push({$or:this.anyTrue})

        

        return returned
    }
}