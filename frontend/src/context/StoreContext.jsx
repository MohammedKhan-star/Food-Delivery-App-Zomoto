import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext({
  cartItems: {},
  food_list: [],
  addToCart: () => {},
  removeFromCart: () => {},
  getTotalCartAmount: () => 0,
  url: "",
  token: "",
  setToken: () => {}
});

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = "https://food-delivery-app-zomoto-backend.onrender.com";

  // ✅ Safe add to cart
  const addToCart = async (itemId) => {
    try {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));

      if (token) {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      // Revert if API call fails
      setCartItems((prev) => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
      }));
    }
  };

  // ✅ Safe remove from cart
  const removeFromCart = async (itemId) => {
    try {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
      }));

      if (token) {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      // Revert if API call fails
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
    }
  };

  // ✅ Safe total calculation
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      if (quantity > 0) {
        const itemInfo = food_list.find(
          (product) => product?._id?.toString() === itemId
        );
        return total + (itemInfo?.price || 0) * quantity;
      }
      return total;
    }, 0);
  };

  // ✅ Fetch data with error handling
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch food list:", err);
      setError("Failed to load menu items");
      setFoodList([]);
    }
  };

  // ✅ Load cart with error handling
  const loadCartData = async (userToken) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token: userToken } }
      );
      setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCartItems({});
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        await fetchFoodList();
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          await loadCartData(storedToken);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize application");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems: cartItems || {},
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loading,
    error
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        props.children
      )}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
