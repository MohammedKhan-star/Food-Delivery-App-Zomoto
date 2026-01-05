import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import "./Home.css";
import AppDownload from "../../components/AppDownload/AppDownload";
import FoodDisplay from "../FoodDisplay/FoodDisplay";
import ChatBot from "../../components/ChatBot/ChatBot";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [foodList, setFoodList] = useState([]);

  useEffect(() => {
    // fetch food items from backend
    const fetchFood = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/food/list"); // backend URL
        const data = await res.json();
        setFoodList(data);
      } catch (error) {
        console.error("Failed to fetch food items", error);
      }
    };
    fetchFood();
  }, []);

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} foodList={foodList} />
      <AppDownload />
      <ChatBot menu={foodList} />
    </div>
  );
};

export default Home;
