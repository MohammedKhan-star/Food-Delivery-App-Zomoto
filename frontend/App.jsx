import React, { useState } from 'react'
import Navbar from './src/components/Navbar/Navbar' 
import {Route, Routes } from 'react-router-dom'
import Home from './src/pages/Home/Home'
import Footer from './src/components/Footer/Footer'
import PlaceOrder from './src/pages/PlaceOrder/PlaceOrder'
import LoginPopup from './src/components/LoginPopup/LoginPopup'
import Cart from './src/pages/Cart/Cart'
import Verify from './src/pages/Verify/Verify';
import MyOrders from './src/pages/MyOrders/MyOrders';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';


const App = () => {
  const [showLogin,setShowLogin]=useState(false)
  return (
    <>
    
    {showLogin ? <LoginPopup setShowLogin={setShowLogin} />:<></>}
    <div className="app">
      <Navbar setShowLogin={setShowLogin} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<PlaceOrder/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path="/verify" element={<Verify />} />
        <Route path="/myorders" element={<MyOrders />} />
        
      </Routes>
      </div>
      <Footer/>

    </>
      )
}

export default App
