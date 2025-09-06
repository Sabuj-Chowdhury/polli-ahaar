// src/provider/AuthProvider.jsx
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import auth from "../firebase/firebase.config";
import AuthContext from "../context/AuthContext";

const googleProvider = new GoogleAuthProvider();

/** Read a minimal user (for instant UI hydration) */
const readMinimalUser = () => {
  try {
    const raw = localStorage.getItem("auth_user_min");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Write/remove minimal user */
const writeMinimalUser = (u) => {
  if (!u) {
    localStorage.removeItem("auth_user_min");
  } else {
    localStorage.setItem("auth_user_min", JSON.stringify(u));
  }
};

const AuthProvider = ({ children }) => {
  // ⬇️ start with minimal user so Navbar doesn’t flash “লগইন”
  const [user, setUser] = useState(readMinimalUser);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  // create user with email and password
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // sign in with email and password
  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // sign in with google
  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // update profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // log out
  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      // 🔒 clear all local caches immediately so UI flips to logged out state
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user_min");
      localStorage.removeItem("is_admin"); // if you cache role in useAdmin
      setUser(null);
      setLoading(false);
    }
  };

  // Firebase auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser?.email) {
          // Build a tiny user for instant UI (only what navbar needs)
          const minimal = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
          };

          setUser(minimal);
          writeMinimalUser(minimal);

          // 1) upsert user in DB (safe to ignore conflicts)
          try {
            await axiosPublic.post("/users", {
              email: minimal.email,
              name: minimal.displayName,
              image: minimal.photoURL,
            });
          } catch (err) {
            // non-fatal
            console.error("save /users failed:", err?.response?.data || err);
          }

          // 2) fetch JWT for secure routes
          try {
            const res = await axiosPublic.post("/jwt", {
              email: minimal.email,
            });
            if (res?.data?.token) {
              localStorage.setItem("token", res.data.token);
            } else {
              localStorage.removeItem("token");
            }
          } catch (err) {
            console.error("fetch /jwt failed:", err?.response?.data || err);
            localStorage.removeItem("token");
          }
        } else {
          // No user
          setUser(null);
          writeMinimalUser(null);
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [axiosPublic]);

  const authInfo = {
    createUser,
    signIn,
    signInWithGoogle,
    logOut,
    updateUserProfile,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
