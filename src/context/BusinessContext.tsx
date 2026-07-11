import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { listBusinesses, Business } from "../api/business";
import { useAuth } from "./AuthContext";

type BusinessContextType = {
  businesses: Business[];
  activeBusiness: Business | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setActiveBusinessId: (id: string) => void;
};

const BusinessContext = createContext<BusinessContextType>(null!);

export function BusinessProvider({ children }: React.PropsWithChildren) {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const list = await listBusinesses();
      setBusinesses(list);
      // If nothing is selected yet, or the previously selected business
      // no longer exists, default to the first one.
      setActiveBusinessId((current) => {
        if (current && list.some((b) => b.id === current)) return current;
        return list[0]?.id ?? null;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  const activeBusiness = useMemo(
    () => businesses.find((b) => b.id === activeBusinessId) ?? businesses[0] ?? null,
    [businesses, activeBusinessId]
  );

  return (
    <BusinessContext.Provider
      value={{ businesses, activeBusiness, loading, refresh, setActiveBusinessId }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
