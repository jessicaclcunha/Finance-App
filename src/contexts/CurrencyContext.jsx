import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { formatCurrency as formatCurrencyUtil, currencySymbol, DEFAULT_CURRENCY } from "../lib/currency";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState(user?.user_metadata?.currency || DEFAULT_CURRENCY);

  // Mantém sincronizado caso os metadados do utilizador mudem (ex: noutro dispositivo)
  useEffect(() => {
    setCurrencyState(user?.user_metadata?.currency || DEFAULT_CURRENCY);
  }, [user?.user_metadata?.currency]);

  const setCurrency = useCallback(async (code) => {
    setCurrencyState(code);
    if (user) {
      const { error } = await supabase.auth.updateUser({ data: { currency: code } });
      if (error) console.error(error);
      return { error };
    }
    return { error: null };
  }, [user]);

  const formatCurrency = useCallback(
    (value, options) => formatCurrencyUtil(value, currency, options),
    [currency]
  );

  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatCurrency,
    symbol: currencySymbol(currency),
  }), [currency, setCurrency, formatCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);