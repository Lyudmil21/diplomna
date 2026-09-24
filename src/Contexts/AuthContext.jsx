import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../Services/supabaseClient.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true); 
    const [lang, setLang] = useState("en");
    const lastCheckedUserId = useRef(null);
    const isFullyLoaded = useRef(false); 

    useEffect(() => {
      const setData = async (session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          if (lastCheckedUserId.current === currentUser.id && isFullyLoaded.current) {
            setLoading(false);
            return;
          }

          lastCheckedUserId.current = currentUser.id;

          const { data, error } = await supabase
            .from("users")
            .select("is_admin, username")
            .eq("id", currentUser.id)
            .maybeSingle();

          console.log("Admin Check Executed:", data, error);

          if (!error && data) {
            setIsAdmin(data.is_admin);
            setUsername(data.username || "User");
            isFullyLoaded.current = true; 
          } else {
            setIsAdmin(false);
          }
        } else {
          lastCheckedUserId.current = null;
          isFullyLoaded.current = false;
          setIsAdmin(false);
          setUsername("");
        }
        setLoading(false);
      };

      const initializeAuth = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            await setData(data.session);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Auth init exception:", err);
          setLoading(false);
        }
      };

      initializeAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
              if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
                  lastCheckedUserId.current = null;
                  isFullyLoaded.current = false;

                  setTimeout(() => {
                      setData(session);
                  }, 0);
              }
          }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }, []);

    return (
      <AuthContext.Provider value={{ user, setUser, isAdmin, username, loading, lang, setLang }}>
        {!loading && children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);