import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./tailadminsrc/context/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const OptionalGoogleProvider = ({ children }) => {
   if (!GOOGLE_CLIENT_ID) return children;
   return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
};

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <HelmetProvider>
         <OptionalGoogleProvider>
            <ThemeProvider>
               <BrowserRouter>
                  <App />
               </BrowserRouter>
            </ThemeProvider>
         </OptionalGoogleProvider>
      </HelmetProvider>
   </StrictMode>
);
