"use client";

import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, DocumentData, Unsubscribe, Firestore } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Loader2 } from "lucide-react"; // Import loading icon
import { auth as firebaseAuth, db } from "@/lib/firebase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData  {
  isPremium?: boolean;
  email: string;
}

interface AuthContextType  {
  user: User | undefined;
  userData: UserData | undefined;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: undefined, userData: undefined, loading: true,
});
 
export function AuthProvider({ children }: { children: React.ReactNode })  {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authUnsubscribe: Unsubscribe | null = null;
    let firestoreUnsubscribe: Unsubscribe | null = null;
    
    if (firebaseAuth) {  
        authUnsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {        
            setUser(firebaseUser || undefined);          
            setLoading(true);
            
            if (firebaseUser && db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                  const data = docSnap.data();
                    if (data) {
                      setUserData({
                         email: firebaseUser.email!,
                         isPremium: data.isPremium || false,
                      });
                    } else {
                        setUserData(undefined);
                    }
                    setLoading(false);           
                });
            } else {
                setUserData(undefined);
                setLoading(false);
            }
        });
    }
        
     return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, []);

    
  // Display a loading skeleton or indicator while fetching auth state or user data
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-6 w-32" />  
                 <Skeleton className="h-8 w-20 rounded-md" />
            </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
           {/* Use Loader2 icon instead of skeletons for main content */}
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <footer className="py-4 text-center text-muted-foreground text-sm border-t">
            <Skeleton className="h-4 w-48 mx-auto" />
        </footer>
    </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 

export const useAuth = (): AuthContextType => { 
  const context = useContext(AuthContext);
  if (!context) { 
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
