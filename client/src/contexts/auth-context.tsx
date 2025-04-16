import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, onAuthStateChange } from "@/lib/firebase";
import { User } from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
}

const initialState: AuthContextType = {
  currentUser: null,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>(initialState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);