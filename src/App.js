import React from 'react'
import Navbar from './components/Navbar'
import TypingTestBody from './components/TypingTestBody'
import FieldBar from './components/FieldBar'
import Other from './components/Other'
import { Card, Row, Col } from 'antd'

const App = () => {
  return (
    <div className='app'>
        <div className='navbar' style={{backgroundColor: 'black !important'}}>
          <Navbar />
        </div>
        <div className='main'>
          <Other />
        </div>
    </div>
  )
}

export default App