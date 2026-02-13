import { createContext, useState, useEffect } from "react";

export const CategoriesContext = createContext();

const defaultCategories = [
  { id: 1, name: "Alimentação", color: "#A85252", icon: "🍽", budget: 500 },
  { id: 2, name: "Transporte", color: "#8A7866", icon: "🚗", budget: 300 },
  { id: 3, name: "Saúde", color: "#7FA87F", icon: "💊", budget: 200 },
  { id: 4, name: "Lazer", color: "#D4A574", icon: "🎭", budget: 150 },
  { id: 5, name: "Educação", color: "#8B3D3D", icon: "📚", budget: 250 },
  { id: 6, name: "Casa", color: "#C46B6B", icon: "🏠", budget: 800 },
];

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const addCategory = (newCategory) => {
    setCategories([...categories, { id: Date.now(), ...newCategory }]);
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updatedCategory } : cat
    ));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      addCategory, 
      updateCategory, 
      deleteCategory 
    }}>
      {children}
    </CategoriesContext.Provider>
  );
};