import { customAlphabet } from "nanoid"


const generateUniequeString=(len)=>{
    const nanoid=customAlphabet('adfghjk123456789',len)
    return nanoid()
}

export default generateUniequeString