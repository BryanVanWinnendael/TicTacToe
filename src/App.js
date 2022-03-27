import React,{useState} from 'react'
import './App.css';
import Lobby from './Components/Lobby';
import GameRoom from './Components/GameRoom';
import { Box} from '@chakra-ui/react'
import { SocketProvider } from './contexts/SocketProvider'
import CreateUser from './Components/CreateUser';
import { useCookies } from "react-cookie";
import Navigation from './Components/Navigation';



function App() {
  const [room,setRoom] = useState()
  const [cookies, setCookie] = useCookies(["user"]);
  return (
    <SocketProvider>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Navigation room={room} setRoom={setRoom}/>
        <Box mw="900px" mt="40px">
          
          {cookies.user && (
            room ?   <GameRoom setRoom={setRoom} room={room}/> :   <Lobby setRoom={setRoom}/>
          )}

          {!cookies.user && (
            <CreateUser/>
          )}
          
        </Box>
      </Box>
    </SocketProvider>
  );
}

export default App;
