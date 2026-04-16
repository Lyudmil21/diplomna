import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../Services/supabaseClient.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
      const setData = async (session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data, error } = await supabase
            .from("users")
            .select("is_admin, username")
            .eq("id", currentUser.id)
            .maybeSingle();

            console.log("Admin Check:", data, error);

          if (!error && data) {
            setIsAdmin(data.is_admin);
            setUsername(data.username || "User");
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
          setUsername("");
        }
        setLoading(false);
      };

      supabase.auth.getSession().then(({ data }) => setData(data?.session));

      const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        setData(session);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }, []);

    return (
      <AuthContext.Provider value={{ user, setUser, isAdmin, username, loading }}>
        {!loading && children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);