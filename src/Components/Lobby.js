import React,{useState,useEffect} from 'react'
import { FormControl, Input,Flex,Text,Button,useColorModeValue,Box,Heading,useToast  } from '@chakra-ui/react'
import { useSocket  } from '../contexts/SocketProvider'
import Axios from 'axios'
import { useCookies } from "react-cookie"

function Lobby(props) {
    const [roomName,setRoomName] = useState()
    const [rooms,setRooms] = useState([])
    const {socket} = useSocket()
    const colorCard = useColorModeValue('#ffffff40', '#20202380')
    const colorCardText = useColorModeValue('black', 'white')
    let componentMounted = true;
    const [cookies, setCookie] = useCookies(["user"]);
    const colorText = useColorModeValue('gray.600', 'gray.300')
    const createRoom = (room) =>{
        socket.emit("create-room",{room,name:cookies.user})
        props.setRoom(room)
    }
    const toast = useToast()
    const joinRoom = (room,size) =>{
        if(size === 2) {
            toast({
                title: `Room is full`,
                status: "error",
                isClosable: true,
            })
            return
        }
        socket.emit("join-room",{room,name:cookies.user})
        props.setRoom(room)
    }


    useEffect(() =>{
    
        Axios.get('http://localhost:3002/api/get-all').then((response) =>{
            if(componentMounted){
                setRooms(response.data)
            }
        })
       
        return () => {componentMounted = false};
    },[rooms])

    return (
        <Box>
           
            <Heading mt="5">Hi, {cookies.user}</Heading>
            <Text mt="2" color={useColorModeValue('gray.600', 'gray.300')} fontSize='xl'>Create a room or join one!</Text>
            <FormControl mt="5">
                <Input onChange={(e) => setRoomName(e.target.value)} placeholder='Room name' mb="5"/>
                <Button onClick={() =>{createRoom(roomName)}} colorScheme='blue' w="full">Create room</Button>
            </FormControl>
            {rooms.length !== 0 && (
                <Text mt="5" fontWeight="bold" fontSize='2xl' color={colorText}>Rooms:</Text>
            )}
            {rooms.length === 0 && (
                <Box>
                    <Text mt="10" fontWeight="bold" fontSize='2xl'>There are no rooms... </Text>
                    <Text fontWeight="bold" fontSize='xl' color={colorText}>Be the first one to create one! </Text>
                </Box>

            )}
            <Box>
                {rooms.map((val,key) =>{
                    return (
                        <Box color={colorCardText} mt="5"  mb="5" bg={colorCard} h="full" borderRadius="md" css={{ backdropFilter: 'blur(10px)' }} boxShadow='2px 1px 8px 2px rgb(0 0 0 / 10%)'>
                            <Flex m="2">
                                <Text  w="full">{val.name}</Text>
                                <Text w="full" textAlign="right">{val.size}/2</Text>
                            </Flex>
                            <Button onClick={() => joinRoom(val.name,val.size)} colorScheme='blue' w="full">Join</Button>
                        </Box>
                    )
                })}
            </Box>
        </Box>
       
    )
}

export default Lobby