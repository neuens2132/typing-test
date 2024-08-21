import React from 'react'
import { Button, Col, Menu, Avatar, Typography, Flex } from 'antd'
import { Link } from 'react-router-dom'

import keyboard from '../images/keyboard-svgrepo-com.svg'
import { Header } from 'antd/es/layout/layout'

const Navbar = () => {
  return (
    <div className='navbar-container' style={{width:'100%'}}>
        <Header style={{display:'flex', justifyContent:'space-between', background:'white'}}>
            <center><Avatar src={keyboard} size={'large'} shape='square'><Link to={"/"}></Link></Avatar></center>
            <Menu theme='light' mode='horizontal'>
                <Menu.Item>
                    <Link to={"/"}>Something</Link>
                </Menu.Item>
                <Menu.Item >
                    <Link to={"/"}>Something else</Link>
                </Menu.Item>
                <Menu.Item >
                    <Link to={"/"}>Home</Link>
                </Menu.Item>
            </Menu>
        </Header>
        
    </div>
  )
}

export default Navbar