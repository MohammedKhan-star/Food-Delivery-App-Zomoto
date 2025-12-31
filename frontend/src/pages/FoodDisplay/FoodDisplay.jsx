import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './food-display.css';

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  if (!food_list || food_list.length === 0) return <p>No food items found</p>;

  const filteredFood = food_list.filter(
    item => category === "All" || category === item.category
  );

  return (
    <div className='food-display' id="food-display">
      <h1>Top Dishes near You</h1>
      <div className="food-display-list">
        {filteredFood.map(item => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
