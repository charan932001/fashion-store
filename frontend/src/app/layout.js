import { Toaster } from "sonner";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import "./globals.css";

export const metadata = {
  title: "Fashion Store",
  description: "Fashion Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>

        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}