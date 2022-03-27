import React, { useContext,useEffect,useState } from 'react'
import {io} from 'socket.io-client'

const SocketContext = React.createContext()

export function useSocket(){
    return useContext(SocketContext)
}

export function SocketProvider({children,id}) {
    const [socket,setSocket] = useState()


    const leaveSocketRoom = () =>{
        socket.close()
        var newSocket
        newSocket = io("http://localhost:3001")
        setSocket(newSocket)
    }


    useEffect(() =>{
        var newSocket
        newSocket = io("http://localhost:3001")
        setSocket(newSocket)
    
        return () => newSocket.close()
    },[id])

    const value = {
        socket,
        leaveSocketRoom,
    };


    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

