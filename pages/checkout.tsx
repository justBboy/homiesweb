import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading, AiOutlinePlus } from "react-icons/ai";
import { FaMoneyCheck } from "react-icons/fa";
import { IoCloseOutline, IoReceiptSharp } from "react-icons/io5";
import { clearCart, selectCarts } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import { orderType, placeOrderManual } from "../features/orders/OrdersSlice";
import { useAlert } from "react-alert";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import OrderSuccessAnimation from "../animations/order-success.json";
import Lottie from "lottie-react";
import CenterModal from "../components/CenterModal";
import OrderItem from "../components/OrderItem";
import axios from "../libs/axios";
import Map from "react-map-gl";
import Modal from "../components/Modal";
import Head from "next/head";

const Checkout = () => {
  const router = useRouter();
  const alert = useAlert();
  const cart = useAppSelector(selectCarts);
  const [totalAmount, setTotalAmount] = useState(0);
  const dispatch = useAppDispatch();
  const [payManualLoading, setPayManualLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, completed } = useFirebaseAuth();
  const [newOrder, setNewOrder] = useState<orderType | null>(null);
  const [locationModal, setLocationModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStreet, setLocationStreet] = useState("");
  const mapRef = useRef(null);
  const [locationLngLat, setLocationLgnLat] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [searchTimer, setSearchTimer] = useState<{ timer: any; last: number }>({
    timer: undefined,
    last: 0,
  });

  useEffect(() => {
    setTotalAmount(
      cart.reduce((p, c) => {
        return p + c.price * c.quantity;
      }, 0)
    );
  }, [cart]);

  useEffect(() => {
    if (error) alert.error(error);
  }, [error]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocationLgnLat({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      });
    });
  }, []);

  useEffect(() => {
    if (completed && !user) {
      alert.error("Log In Before Placing Order");
      router.push("/login");
    }
  }, [user, completed]);

  console.log(locationLngLat);
  useEffect(() => {
    if (locationStreet) {
      (async () => {
        setLocationLoading(true);
        if (Date.now() - searchTimer.last < 3 * 1000) {
          if (searchTimer.timer) clearTimeout(searchTimer.timer);
        }
        let timer = setTimeout(async () => {
          const res = await axios.get(
            `/globals/get_long_lat/${locationStreet}`
          );
          setLocationLoading(false);
          if (res.data.error) return setError(res.data.error);
          console.log(res.data);
          setLocationLgnLat({
            longitude: res.data.geometry.location.lng,
            latitude: res.data.geometry.location.lat,
          });
        }, 800);
        setSearchTimer({
          last: Date.now(),
          timer: timer,
        });
      })();
    } else {
      //setLocationLgnLat(null);
      setLocationLoading(false);
      if (searchTimer.timer) clearTimeout(searchTimer.timer);
    }
  }, [locationStreet]);

  useEffect(() => {
    console.log(mapRef);
    if (locationLngLat) {
      (mapRef.current as any)?.flyTo({
        center: [locationLngLat.longitude, locationLngLat.latitude],
      });
    }
  }, [locationLngLat]);

  const handlePayManually = async () => {
    if (locationStreet && locationLngLat) {
      setPayManualLoading(true);
      const foods: { id: string; quantity: number }[] = cart.map((c) => ({
        id: c.id,
        quantity: c.quantity,
      }));
      const res = await dispatch(
        placeOrderManual({ foods, locationStreet, locationLngLat })
      );
      setPayManualLoading(false);
      if (res.meta.requestStatus === "rejected")
        return setError("There was any error, please try again");
      const newOrder = res.payload;
      dispatch(clearCart());
      setNewOrder(newOrder);
    } else {
      setError("Set Location before proceed");
    }
  };

  if (completed && user) {
    return (
      <div
        className={`bg-graybg w-screen min-h-screen flex items-center justify-center`}
      >
        <Head>
          <title>Homiezfoods - Checkout</title>
        </Head>
        {newOrder && (
          <div
            className={`absolute top-0 left-0 w-screen h-screen overflow-hidden`}
          >
            <Lottie animationData={OrderSuccessAnimation} autoPlay loop />
          </div>
        )}
        {newOrder && (
          <CenterModal show={Boolean(newOrder)} onOutsideClicked={() => {}}>
            <OrderItem order={newOrder} />
          </CenterModal>
        )}
        <Modal show={locationModal}>
          <div
            className={`w-screen h-screen bg-[#00000088] animate__animated animate__fadeIn`}
          >
            <div className={`w-full h-full pt-[9rem] overflow-hidden`}>
              <div
                className={`rounded-md overflow-hidden sm:w-[80%] w-[98%] mx-auto`}
              >
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: locationLngLat?.longitude || -0.205874,
                    latitude: locationLngLat?.latitude || 5.614818,
                    zoom: 16,
                  }}
                  mapboxAccessToken="pk.eyJ1IjoianVzdGJib3kiLCJhIjoiY2w1N3U0amExMGd4MTNmcWw5cXZjZGdqcyJ9.zs2LYJKtEgV28M_2cDeJ9g"
                  style={{
                    width: "100%",
                    height: 600,
                    marginTop: 20,
                    borderRadius: 10,
                  }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                />
              </div>
            </div>
          </div>
        </Modal>

        <div className={`mx-auto min-w-[90%] sm:min-w-[70%] min-h-screen pt-2`}>
          <div className={``}>
            <Link href="/">
              <div
                className={`w-[180px] sm:w-[240px] aspect-[3.378/1] relative`}
              >
                <Image
                  layout="fill"
                  src="/v1656606687/logo-no-bg_luwdcs.png"
                  className={`cursor-pointer`}
                  alt="Homiez Foods logo"
                />
              </div>
            </Link>
          </div>
          <div className={`flex flex-col items-center p-2 sm:p-5`}>
            <div className={`w-full relative z-[80]`}>
              {locationModal && (
                <IoCloseOutline
                  onClick={() => setLocationModal(false)}
                  className={`text-4xl text-orange-600 absolute translate-y-[-50px] right-0 cursor-pointer hover:scale-[0.98] animate__animated animate__fadeIn`}
                />
              )}

              <h2
                className={`text-2xl left-[50%] translate-x-[-50%] mb-2 ${
                  locationModal ? "text-white" : "text-slate-800"
                } transition-all absolute translate-y-[-50px]`}
              >
                {locationStreet}
              </h2>
              <input
                type="text"
                value={locationStreet}
                placeholder="Set Location For Delivery"
                onFocus={() => {
                  setLocationModal(true);
                }}
                onChange={(e) => {
                  setLocationStreet(e.target.value);
                }}
                className={`appearance-none border border-slate-200 p-3 rounded-md w-full cursor-pointer shadow-sm hover:shadow-md outline-[#000000a3] text-md transition-all duration-800`}
              />
              {locationLoading && (
                <AiOutlineLoading
                  className={`text-2xl animate-spin absolute right-5 top-2`}
                  color="black"
                />
              )}
            </div>
            {cart.map((c, indx) => (
              <div key={c.id} className={`w-full`}>
                <div
                  className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
                >
                  <h4 className={`font-gotham text-slate-800 `}>{c.name}</h4>
                  <h5 className={`font-gothamMedium text-slate-700`}>
                    Ghs{c.price}
                    {c.quantity > 1 && (
                      <span className={`font-sm text-light font-gothamLight`}>
                        -{c.quantity}x
                      </span>
                    )}
                  </h5>
                </div>
                <div className="w-full flex items-center justify-center mt-2">
                  {indx < cart.length - 1 && (
                    <AiOutlinePlus className={`text-2xl text-slate-600`} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={`flex flex-col w-full items-end mt-2`}>
            <h2 className={`text-xl mb-1 p-3`}>Total - ₵{totalAmount}</h2>
            <div className={`w-full flex flex-col`}>
              <button
                onClick={() => {
                  alert.info(
                    "Option not available now, try paying on delivery"
                  );
                }}
                className="flex items-center justify-center shadow uppercase h-12 mt-3 text-white w-full rounded bg-blue-600 hover:bg-blue-700"
              >
                <FaMoneyCheck
                  className={`text-slate-600 text-xl`}
                  color="#eee"
                />
                <span className={`font-bold ml-3`}>Pay Now </span>
              </button>
              <h3 className={`text-md text-center m-2`}>OR</h3>
              <button
                disabled={payManualLoading}
                onClick={handlePayManually}
                className={`flex items-center ${
                  payManualLoading ? "opacity-80" : "opacity-100"
                } justify-center shadow uppercase h-12 text-white w-full rounded bg-pink-600 hover:bg-pink-700`}
              >
                {payManualLoading ? (
                  <AiOutlineLoading className={`text-xl animate-spin`} />
                ) : (
                  <>
                    <IoReceiptSharp
                      className={`text-slate-600 text-xl`}
                      color="#eee"
                    />
                    <span className={`font-bold ml-3`}>Pay On Delivery</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full h-screen flex justify-center items-center`}>
      <Loader />
    </div>
  );
};

export default Checkout;
