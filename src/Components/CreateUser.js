import React,{useState} from 'react'
import { useCookies } from "react-cookie"
import { Input,Button,
    FormControl,
    Image,
 } from '@chakra-ui/react'


function CreateUser() {
    const [username,setUsername] = useState("")
    const [cookies, setCookie] = useCookies(["user"]);

    const join = () =>{
        setCookie("user", username, {
            path: "/"
          });
    }

    return (
        <FormControl mt="5">
            <Image src='/game.svg' alt='game svg' height="300px" mb="5"/>
            <Input onChange={(e) => setUsername(e.target.value)} placeholder='Username' mb="5"/>
            <Button onClick={join} colorScheme='blue' w="full">Join</Button>
        </FormControl>
    )
}

export default CreateUser