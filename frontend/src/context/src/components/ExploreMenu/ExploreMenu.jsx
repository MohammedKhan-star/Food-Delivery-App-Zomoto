import React from 'react'
import {menu_list} from '../../assets/assets'
import './ExploreMenu.css'

const ExploreMenu = ({ category, setCategory}) => {

   
  return (
     <div className="explore-menu" id="explore-Menu" >
          <h1 className="explore-head">Explore Our Menu</h1>
         <p className="explore-menu-test">Choose from a Diverse Menu featuring a delectable array of dishes our mission is ti sati</p>     
          <div className="explore-Menu-list">
              {menu_list.map((item,index) => {
                  return (
                      <div  onClick={()=>setCategory(prev=>prev===item.menu_name ?"All":item.menu_name)} className="explore_menu_list" key={index} >
                          <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                          <p>{item.menu_name}</p>

                      </div>
                  )
              })}
          </div>
          <hr className='hr'/>
      </div>
  )
}

export default ExploreMenu
