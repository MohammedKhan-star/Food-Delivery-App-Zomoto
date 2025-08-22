import React,{ useContext, useState } from 'react'
import {assets} from '../../assets/assets'
import {Link, useNavigate} from 'react-router-dom'
import  './Navbar.css'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({setShowLogin}) => {
  const [menu, setMenu] = useState("home");
  const {getTotalCartAmount,token,setToken}=useContext(StoreContext)
  
  const navigate=useNavigate();
  

  const logout=()=>{
    localStorage.removeItem("token")
    setToken("");
    navigate("/")

  }
  return (
        <div className='navbar'>
           <Link to="/"><img src={assets.logo} alt="" className="log" /></Link>
            <ul className="navbar-menu">
                <Link to="/" onClick={()=>setMenu("home")} className={menu==="home"? "active":""}>home</Link>
                <a href="#explore-Menu" onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
                <a href='#app-download' onClick={()=>setMenu("mobile-App")} className={menu==="mobile-App"?"active":""}>mobile-App</a>
                <a href="#footer" onClick={()=>setMenu("contact Us")} className={menu==="contact Us"?"active":""}>contact Us</a>
        </ul>
        <div className="navbar-right">
          <img src={assets.search_icon} alt="" />
        
        <div className="navbar-search_icon">
         <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link> 
          <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
          {!token? <button onClick={()=>setShowLogin(true)}>Sign in</button>:<div className='navbar-profile'>
            <img src={assets.profile_icon} alt=""/>
             <ul className='nav-profile-dropdown'>
              <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><Link to="/myorders"><p>Orders</p></Link></li>
              <hr/>
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
             </ul>
            </div>
            
          }
         
          
        </div>
        
    </div>
  )
}

export default Navbar
