import React, { useContext } from 'react';
import './food-display.css'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../Food_Item/Food_Item'; // ✅ Correct if this file exists

const FoodDisplay = ({category}) => {
  const { food_list } = useContext(StoreContext);

  return (
    <div className='food-display' id="food-display">
      <h1>Top Dishes near You.</h1>
      <div className="food-display-list">
        {food_list.map((item, index) => {
          if(category==="All"||category===item.category){
               return (
                <FoodItem 
            
                  key={index}
                  id={item._id} 
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                />
            
          );

          }
       
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;
