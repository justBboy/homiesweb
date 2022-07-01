import AOS from "aos";
import "animate.css";
import "aos/dist/aos.css";
import "../styles/fonts.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { persistor, store } from "../features/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { transitions, positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  position: positions.BOTTOM_RIGHT,
  timeout: 5000,
  offset: "30px",
  transition: transitions.SCALE,
};
function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    AOS.init({
      once: true,
    });
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider template={AlertTemplate} {...options}>
          <Component {...pageProps} />
        </AlertProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
