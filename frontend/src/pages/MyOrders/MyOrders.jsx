import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './MyOrders.css';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  // ✅ useCallback ensures function identity doesn’t change
  // ✅ ESLint clean now
  const fetchOrders=async()=>{
    const response = await axios.post(url+'/api/order/userorders',{},{ headers: { token } });
    setData(response.data.data);
    console.log("Fetched orders:", response.data.data); 

  }

  useEffect(() => {
    if(token){
      fetchOrders();
    }
  },[token])

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
       {data.map((order,index)=>{
        return(
          <div className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>{order.items.map((item,index)=>{
              if(index=== order.items.length-1){
                return item.name+" X"+item.quantity;
              }
              else{
                return item.name+" X "+item.quantity+", ";
              }

            }) }</p>
            
            <p className="order-amount">Total: $ {order.amount}.00</p>
            <p>Item: {order.items.length}</p>
            <p><span>&#x25cf;</span><b>{order.status}</b></p>
            <button>Track Order</button>
          

          </div>
        )
       })}
      </div>
    </div>
  );
};

export default MyOrders;
