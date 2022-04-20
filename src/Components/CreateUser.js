import React,{useState} from 'react'
import { useCookies } from "react-cookie"
import { Input,Button,
    FormControl,
    Image,
 } from '@chakra-ui/react'


function CreateUser() {
    const [username,setUsername] = useState("")
    const [cookies, setCookie] = useCookies(["user"]);

    const join = (e) =>{
        e.preventDefault()
        setCookie("user", username, {
            path: "/"
          });
    }

    return (
        <form mt="5">
            <Image src='/game.svg' alt='game svg' height="300px" mb="5"/>
            <Input onChange={(e) => setUsername(e.target.value)} placeholder='Username' mb="5"/>
            <Button onClick={join} colorScheme='blue' w="full" type="submit">Join</Button>
        </form>
    )
}

export default CreateUser