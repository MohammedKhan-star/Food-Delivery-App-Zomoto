import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import './food.css'
import { StoreContext } from '../../context/StoreContext'

const Food_Item = ({id, name, price, description, image}) => {
  const {cartItems = {}, addToCart, removeFromCart, url} = useContext(StoreContext)
  
  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        <img 
          className='food-item-image' 
          src={`${url}/images/${image}`} 
          alt={name} 
        />
        {
          !cartItems[id] ? (
            <img 
              className='add' 
              onClick={() => addToCart(id)} 
              src={assets.add_icon_white} 
              alt="Add to cart"
            />
          ) : (
            <div className='food-item-counter'>
              <img 
                onClick={() => removeFromCart(id)} 
                src={assets.remove_icon_red} 
                alt="Remove item"
              />
              <p>{cartItems[id]}</p>
              <img 
                onClick={() => addToCart(id)} 
                src={assets.add_icon_green} 
                alt="Add more" 
              />
            </div>
          )
        }
      </div>  
      <div className="food-item-name-rating">
        <p>{name}</p>
        <img src={assets.rating_starts} alt="Rating stars" />
      </div>
      <p className="food-item-desc">{description}</p>
      <p className="food-item-price">${price}</p>
    </div>
  )
}

export default Food_Item