import React,{useState} from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import './Home.css'
import AppDownload from '../../components/AppDownload/AppDownload'
import FoodDisplay from '../FoodDisplay/FoodDisplay'


const Home = () => {
  const[category,setCategory]=useState("All")
  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} />
    
      <FoodDisplay category={category}  />  
        
      <AppDownload/>


    </div>

  )
}

export default Home
