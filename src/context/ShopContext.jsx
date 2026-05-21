import { createContext, useContext, useState } from "react";
import { productConfig } from "../productConfig";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [selectedMetal, setSelectedMetal] = useState(productConfig.metals[0]);
  const [selectedStone, setSelectedStone] = useState(productConfig.stones[0]);
  const [selectedLength, setSelectedLength] = useState(productConfig.lengths[1]); // Default to 19cm
  
  // Shared price utility
  const basePrice = 165;
  const priceModifier = selectedMetal.priceOffset || 0;
  const totalPrice = basePrice + priceModifier;

  return (
    <ShopContext.Provider value={{ 
      selectedMetal, setSelectedMetal, 
      selectedStone, setSelectedStone, 
      selectedLength, setSelectedLength, 
      basePrice, priceModifier, totalPrice 
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
