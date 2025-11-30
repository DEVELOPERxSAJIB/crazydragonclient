import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "swiper/css";
import { Provider } from "react-redux";
import { store } from "./app/store.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </SocketProvider>
    </Provider>
  </StrictMode>
);
