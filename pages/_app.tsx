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
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Head from "next/head";

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
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff"></meta>
      </Head>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider template={AlertTemplate} {...options}>
          <Component {...pageProps} />
        </AlertProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
