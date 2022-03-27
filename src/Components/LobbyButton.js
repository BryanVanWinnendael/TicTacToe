import { IconButton, Icon } from '@chakra-ui/react'
import { ImExit } from 'react-icons/im';
import { useSocket  } from '../contexts/SocketProvider'

const LobbyButton = (props) => {
    const {leaveSocketRoom} = useSocket()

    const leaveroom = () =>{
        props.setRoom()
        leaveSocketRoom()
    }

    return (
        <IconButton
                onClick={leaveroom}
                marginRight="10px"
                size='lg'
                _hover={{
                    background: "red.300"
                }}
                bg="red.400"
                aria-label="Toggle theme"
                icon={<Icon color={"white"} as={ImExit} />}
            ></IconButton>
    )
}

export default LobbyButton
