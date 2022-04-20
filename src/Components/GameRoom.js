import React,{useState,useEffect,useRef} from 'react'
import { Box, Input,Grid,Text,Button,useColorModeValue,Flex,Heading,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    useMediaQuery 
} from '@chakra-ui/react'
import { useSocket  } from '../contexts/SocketProvider'
import Axios from 'axios'
import { useCookies } from "react-cookie"

function GameRoom(props) {
    const [chatText,setChatText] = useState()
    const {socket,leaveSocketRoom} = useSocket()
    const room = props.room
    const [opponent, setOpponent] = useState()
    const [countPlayer, setCountPlayer] = useState([])
    const [turn, setTurn] = useState()
    const [pattern, setPattern] = useState()
    const [winner, setWinner] = useState()
    const [playagain, setPlayagain] = useState()
    const [isLargerThan730] = useMediaQuery('(min-width: 730px)')
    
    const colorText = useColorModeValue('gray.600', 'gray.300')
    const messageEl = useRef(null);
    let componentMounted = true;

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    const [board, setBoard] = useState(
        [
            [{position:"0",player:""},{position:"1",player:""},{position:"2",player:""}],
            [{position:"3",player:""},{position:"4",player:""},{position:"5",player:""}],
            [{position:"6",player:""},{position:"7",player:""},{position:"8",player:""}]
        ]
    )
    const [cookies, setCookie] = useCookies(["user"]);
    
    const colorCard = useColorModeValue('white', '#20202380')



    useEffect(() =>{

        if (socket == null) return

        socket.on("receive-message", (message,sender) =>{
            displayMessage(message,sender)
            chatScroll()
        })

        socket.on("opponent-joined",name =>{
            const randomOpp = generateRandomTurn(cookies.user,name)

            if(randomOpp === cookies.user) setPattern("x")
            else setPattern("o")

            setOpponent(name)
            setTurn(randomOpp)
            socket.emit("start-game",{room, opponent: cookies.user, randomOpp})
        })

        socket.on("start-game",({opponent, randomOpp}) =>{
            setOpponent(opponent)
            setTurn(randomOpp)
            if(randomOpp === cookies.user) setPattern("x")
            else setPattern("o")
        })

        socket.on("turn", ({newBoard,turn}) =>{
            if(giveWinner(newBoard)) {
                onOpen()
                setWinner(giveWinner(newBoard)) 
                return
            }
            else if(isBoardFull(newBoard)){
                onOpen()
                setWinner("draw")
                return
            }
            setTurn(turn)
            setBoard(newBoard)
        })

        socket.on("play-again", user =>{
            setPlayagain(user)
        })

        socket.on("play-again-generate", randomOpp =>{
            setTurn(randomOpp)
        })

        
        return () => {
            socket.off('receive-message')
        }
    },[socket])

    const generateRandomTurn = (user1,user2) =>{
        const random = Math.floor(Math.random() * 2) + 1
        var randomOpp = ""

        if(random === 2){
            randomOpp = user1
        }else{
            randomOpp = user2
        }
        return randomOpp
        
    }

    const fetchOnline = () =>{
        if(componentMounted){
            Axios.get('https://apitictactoegame.herokuapp.com/api/get-active-users',{
                params: {
                   room
                  }
            }).then((response) =>{
                let aux = [...countPlayer]
                setCountPlayer(aux)
                if(opponent && response.data === 1){
                    setOpponent()
                    setBoard( [
                        [{position:"0",player:""},{position:"1",player:""},{position:"2",player:""}],
                        [{position:"3",player:""},{position:"4",player:""},{position:"5",player:""}],
                        [{position:"6",player:""},{position:"7",player:""},{position:"8",player:""}]
                    ])
                    setTurn()
                }
            })
        }
    }

    useEffect(() =>{
        fetchOnline()
        return () => {componentMounted = false};
    },[countPlayer])

    const leaveRoom = () =>{
        props.setRoom()
        leaveSocketRoom()
    }

    const resetBoard = () =>{
        onClose()
        setBoard( [
            [{position:"0",player:""},{position:"1",player:""},{position:"2",player:""}],
            [{position:"3",player:""},{position:"4",player:""},{position:"5",player:""}],
            [{position:"6",player:""},{position:"7",player:""},{position:"8",player:""}]
        ])

        const randomOpp = generateRandomTurn(cookies.user,opponent)

        if(playagain){
            setTurn(randomOpp)
            socket.emit("play-again-generate",{room, randomOpp})
        }

        
        socket.emit("play-again",{room, user: cookies.user})
    }
 
    const chatScroll = () =>{
        messageEl.current.addEventListener('DOMNodeInserted', event => {
            const { currentTarget: target } = event;
            target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
          });
    }

    const handleSubmitChat = (e) =>{
        e.preventDefault()
        if(chatText === "") return
        displayMessage(chatText,"you")
        setChatText("")
        socket.emit("send-message",chatText,room,cookies.user)
        chatScroll()
    }

    const displayMessage = (message,sender) => {
      
        const div = document.createElement("div")
        div.style.display = "flex"
        div.style.flexDirection = "row"

        const sendName = document.createElement("p")
        if(sender === "you") sendName.textContent = "You: " 
        else sendName.textContent = sender + ":"
        
        sendName.style.fontWeight = "bold"
        sendName.style.marginRight = "5px"

        const p = document.createElement("p")
        p.textContent = message

        div.append(sendName)
        div.append(p)

        document.getElementById("chat").append(div)
    }

    function setBoardFunc(position,board){
        for(let i of board){
            for(let j of i){
                if(j.position === position){
                    j.player = pattern
                }
            }
        }
       
        return board
    }

    const handleTurn =  (position) =>{
        setPlayagain()
        const newBoard = setBoardFunc(position,board)
        setBoard(newBoard)
        setTurn(opponent)
        if(giveWinner(newBoard)){
            onOpen()
            setWinner(giveWinner(newBoard)) 
        } 
        else if(isBoardFull(board)){
            onOpen()
            setWinner("draw")
        }
        socket.emit("turn",{newBoard,room,turn:opponent})
    }

    function equals3(a, b, c){
        return a.player === b.player && b.player === c.player && a.player !== ""
    }

    // check if board is full
    function isBoardFull(board){
        for(let i of board){
            for(let j of i){
                if(j.player === "") return false
            }
        }
        return true
    }
    
    function giveWinner(board){
      let winner = null
    
      // horizontal
      for (let i = 0; i < 3; i++) {
        if (equals3(board[i][0], board[i][1], board[i][2])) {
          winner = board[i][0]
        }
      }
    
      // Vertical
      for (let i = 0; i < 3; i++) {
        if (equals3(board[0][i], board[1][i], board[2][i])) {
          winner = board[0][i]
        }
      }
    
      // Diagonal
      if (equals3(board[0][0], board[1][1], board[2][2])) {
        winner = board[0][0]
      }
      if (equals3(board[2][0], board[1][1], board[0][2])) {
        winner = board[2][0]
      }
      return winner?.player
    }

   




    return (
        <Box mt="5">
            <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={cancelRef}
            isOpen={isOpen}
            isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {winner && winner === pattern && winner !== "draw" &&(
                            <Text>You won!</Text>
                        )}
                        {winner && winner !== pattern && winner !== "draw" && (
                            <Text>{opponent} won!</Text>
                        )}
                        { winner === "draw" && (
                            <Text>Draw!</Text>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogBody>
                       Do you want to play again?
                       {playagain && (
                           <Text>
                                {playagain} wants to play again
                           </Text>
                          
                       )}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button colorScheme='red' ref={cancelRef} onClick={leaveRoom}>
                        No
                        </Button>
                        <Button colorScheme='blue' ml={3} onClick={resetBoard}>
                        Yes
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            
            {opponent && (
                <Heading m="2">Playing against {opponent}</Heading>
            )}

            <Text color={colorText} m="2" fontSize='2xl'>You are {pattern}</Text>

            {!opponent && (
                <Text mt="10" fontWeight="bold" fontSize='2xl'>Waiting for a player to join... </Text>

            )}
            
            {turn && turn === cookies.user && (
                <Text color={colorText} m="2" fontSize='2xl'>It is now your turn</Text>
            )}
            
            {turn && turn !== cookies.user && (
                <Text color={colorText} m="2" fontSize='2xl'>It is now {turn}´s turn</Text>
            )}


            {opponent && (
                <Flex flexDirection={isLargerThan730 ? 'row' : 'column'}>
                    <Grid templateRows="repeat(3, 1fr)" mt="5">
                    {board.map((val,key) =>{
                        return(
                            <Grid templateColumns="repeat(3, 1fr)" >
                                {val.map((val,key) =>{
                                    return(
                                        <Button onClick={() => handleTurn(val.position)} disabled={turn !== cookies.user | val.player !== ""} fontSize="5xl" h="5rem" w="5rem" m="2" boxShadow='2px 1px 8px 2px rgb(0 0 0 / 10%)' bg={colorCard} css={{ backdropFilter: 'blur(10px)' }} borderRadius="md" >{val.player}</Button>
                                    )
                                })}
                            </Grid>
                        )
                    })}
                    </Grid> 
                     <form ml={isLargerThan730 ? '10' : '0'} mt="5">
                        <Input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder='Text' mb="5"/>
                        <Button onClick={handleSubmitChat} colorScheme='blue' w="full" type="submit">send text</Button>
                        <Box ref={messageEl} id='chat' maxHeight="150px" overflowY="scroll" mt="5"></Box>
                    </form>
                </Flex>
                
            )}
            
           
        </Box>
    )
}

export default GameRoom