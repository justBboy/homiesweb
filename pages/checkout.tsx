import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineLoading, AiOutlinePlus } from "react-icons/ai";
import { FaMoneyCheck } from "react-icons/fa";
import { IoReceiptOutline, IoReceiptSharp } from "react-icons/io5";
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
    if (completed && !user) {
      alert.error("Log In Before Placing Order");
      router.push("/login");
    }
  }, [user, completed]);

  const handlePayManually = async () => {
    setPayManualLoading(true);
    const foods: { id: string; quantity: number }[] = cart.map((c) => ({
      id: c.id,
      quantity: c.quantity,
    }));
    const res = await dispatch(placeOrderManual(foods));
    setPayManualLoading(false);
    if (res.meta.requestStatus === "rejected")
      return setError((res as any).error.message);
    const newOrder = res.payload;
    alert.success("Order Placed Successfully");
    dispatch(clearCart());
    setNewOrder(newOrder);
  };

  if (completed && user) {
    return (
      <div
        className={`bg-graybg w-screen min-h-screen flex items-center justify-center`}
      >
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

        <div className={`mx-auto min-w-[90%] sm:min-w-[70%] min-h-screen pt-2`}>
          <div className={``}>
            <Link href="/">
              <div
                className={`w-[180px] sm:w-[240px] aspect-[3.378/1] relative`}
              >
                <Image
                  layout="fill"
                  src="/images/logo-no-bg.png"
                  className={`cursor-pointer`}
                  alt="Homiez Foods logo"
                />
              </div>
            </Link>
          </div>
          <div className={`flex flex-col items-center p-2 sm:p-5`}>
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
              <button className="flex items-center justify-center shadow uppercase h-12 mt-3 text-white w-full rounded bg-blue-600 hover:bg-blue-700">
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
