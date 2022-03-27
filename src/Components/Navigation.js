import React from 'react'
import {Flex} from '@chakra-ui/react'
import ToggleThemeButton from './ToggleThemeButton'
import LobbyButton from './LobbyButton'

function Navigation(props) {
   
    return (
    <Flex mt="3" mr="3" justifyContent="right" maxWidth="700px" position={"fixed"} width={"100%"} >
        {props.room && (
            <LobbyButton setRoom={props.setRoom}/>
        )}
        <ToggleThemeButton/>
    </Flex>
    )
}

export default Navigation