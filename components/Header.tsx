import { useLottie } from "lottie-react";
import Link from "next/link";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { BiFoodMenu, BiSearchAlt2, BiUserCheck, BiCart } from "react-icons/bi";
import {
  AiOutlineShoppingCart,
  AiOutlineClose,
  AiOutlineInbox,
  AiOutlineShareAlt,
  AiOutlineUser,
} from "react-icons/ai";
import { MdOutlineAccountCircle, MdOutlineVerifiedUser } from "react-icons/md";
import { RiAccountBoxLine } from "react-icons/ri";
import foodChoiceAnimation from "../animations/food-choice.json";
import vegetableAnim from "../animations/clean-vegetable.json";
import beverageAnim from "../animations/burger.json";
import RightModal from "./RightModal";
import FoodCart from "./FoodCart";
import { auth } from "../libs/Firebase";
import { signOut } from "firebase/auth";
import ConfirmModal from "./ConfirmModal";
import { GoPrimitiveDot } from "react-icons/go";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import { selectCategories } from "../features/categories/categoriesSlice";
import { collection, doc, getDoc } from "firebase/firestore";
import { clearCart, selectCarts } from "../features/cart/cartSlice";
import { FaRegUser } from "react-icons/fa";
import { useRouter } from "next/router";
import { setRefCode } from "../features/auth/authSlice";
import axios from "../libs/axios";

interface props {
  scrolled?: boolean;
  withoutSearch?: boolean;
  children?: ReactElement;
  foodsLoading?: boolean;
  search?: string;
  setSearch?: (val: string) => void;
  setFoodsLoading?: (b: boolean) => void;
}

const Header: React.FC<props> = ({
  scrolled,
  withoutSearch,
  children,
  foodsLoading,
  search,
  setSearch,
  setFoodsLoading,
}) => {
  const router = useRouter();
  const accountContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const cart = useAppSelector(selectCarts);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const { user, completed } = useFirebaseAuth();

  const { rc } = router.query;

  const [showMenu, setShowMenu] = useState(false);
  const [accountClicked, setAccountClicked] = useState(false);
  const foodChoiceOptions = {
    animationData: foodChoiceAnimation,
    loop: true,
    autoplay: true,
  };
  const vegetableAnimationOptions = {
    animationData: vegetableAnim,
    loop: true,
    autoplay: true,
  };
  const beverageAnimationOptions = {
    animationData: beverageAnim,
    loop: true,
    autoplay: true,
  };
  const { View } = useLottie(foodChoiceOptions);
  const { View: vegetablesAnimation } = useLottie(vegetableAnimationOptions);
  const { View: beverageAnimation } = useLottie(beverageAnimationOptions);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await signOut(auth);
    setLogoutLoading(false);
  };

  useEffect(() => {
    if (scrolled) {
      setAccountClicked(false);
    }
  }, [scrolled]);

  useEffect(() => {
    if (rc) {
      dispatch(setRefCode(rc.toString()));
    }
  }, [router]);

  useEffect(() => {
    const totalAmount = cart.reduce((p, c, indx) => {
      return p + c.price * c.quantity;
    }, 0);
    setCartTotalAmount(totalAmount);
  }, [cart]);

  useEffect(() => {
    let evt = (e: any) => {
      if (
        accountContainerRef.current &&
        !accountContainerRef.current.contains(e.target)
      ) {
        setAccountClicked(false);
      }
    };
    document.addEventListener("mousedown", evt);
    return () => {
      document.removeEventListener("mousedown", evt);
    };
  }, []);

  return (
    <>
      {logoutConfirm && (
        <ConfirmModal
          show={logoutConfirm}
          setShow={setLogoutConfirm}
          loading={logoutLoading}
          onConfirm={handleLogout}
          confirmText="Are you sure you want to logout?"
        />
      )}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
        }}
        className={`w-full sm:px-10 px-3 bg-orange-600 transition-all duration-1000 ${
          scrolled ? "opacity-0 h-0" : "opacity-1 h-[60px]"
        }`}
      >
        <div
          className={`mx-auto md:max-w-[768px] xl:max-w-[1024px] 2xl:max-w-[1324px] flex justify-between items-center h-full transition-transform duration-1000`}
        >
          <Link href="/">
            <img
              src="/images/hmzs-min.png"
              className={`w-[110px] p-1 sm:w-[180px] cursor-pointer`}
              alt="Homiez Foods logo"
            />
          </Link>
          <div className={`pl-3 flex items-center`}>
            <div
              className={`account-nav-cont py-5 relative flex flex-col justify-center`}
            >
              <a
                onClick={() => {
                  setAccountClicked((v) => !v);
                }}
                className="mr-5 cursor-pointer"
              >
                <div
                  className={`flex flex-col justify-center items-center`}
                  title="Your Account"
                >
                  <AiOutlineUser className={`text-slate-100 text-3xl mr-1`} />
                  <h6
                    className={`flex items-center font-gothamLight font-xs text-[8px] sm:text-md text-white mr-1`}
                  >
                    <span className="mr-1">Account</span>
                    {user && <GoPrimitiveDot color="#4f3" />}
                  </h6>
                </div>
              </a>
              <div
                ref={accountContainerRef}
                className={`account-card fixed ${
                  accountClicked ? "visible" : "invisible"
                } translate-y-[60%] translate-x-[-35%] rounded z-10 w-[206px] min-h-[80px] bg-slate-50 shadow`}
              >
                {user ? (
                  <>
                    <p className="text-sm font-thin text-center mt-2 break-words">
                      {user.username || user.email || user.phone}
                    </p>
                    <a
                      onClick={() => {
                        setAccountClicked(false);
                        setLogoutConfirm(true);
                      }}
                      className={`mt-3 flex items-center cursor-pointer justify-center w-[80%] mx-auto p-1 bg-red-500 hover:bg-red-600 text-slate-100 rounded-md shadow-md`}
                    >
                      Logout
                    </a>
                  </>
                ) : (
                  <Link href="/login">
                    <a
                      className={`mt-3 flex items-center justify-center w-[80%] mx-auto p-1 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
                    >
                      Sign In
                    </a>
                  </Link>
                )}
                <hr className={`mt-2 text-2xl`} />
                <div className={`w-full`}>
                  <Link href="/account">
                    <a
                      className={`flex items-center hover:bg-slate-200 w-full p-2 mt-2 cursor-pointer mb-2`}
                    >
                      <RiAccountBoxLine className={`text-xl text-slate-600`} />
                      <span className={`text-sm ml-2 font-gotham font-bold`}>
                        Account
                      </span>
                    </a>
                  </Link>
                  <Link href="/orders">
                    <a
                      className={`flex items-center hover:bg-slate-200 w-full p-2 mt-2 cursor-pointer mb-2`}
                    >
                      <AiOutlineInbox className={`text-xl text-slate-600`} />
                      <span className={`text-sm ml-2 font-gotham font-bold`}>
                        Orders
                      </span>
                    </a>
                  </Link>
                  <hr />
                  {user?.agent && (
                    <Link href="/agentConsole">
                      <a
                        className={`flex items-center hover:bg-slate-200 w-full p-2 mt-2 cursor-pointer mb-2`}
                      >
                        <AiOutlineShareAlt
                          className={`text-xl text-slate-600`}
                        />
                        <span className={`text-sm ml-2 font-gotham font-bold`}>
                          Agent Console
                        </span>
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {!user?.admin && !user?.superadmin && !user?.agent && (
              <Link href="/agentRequest">
                <a className="mr-2 sm:mr-5">
                  <div
                    className={`flex justify-center flex-col items-center overflow-hidden`}
                  >
                    <MdOutlineVerifiedUser
                      className={`agent-icon text-slate-100 text-3xl font-sm mr-1 text-white`}
                    />
                    <h6
                      className={`font-gothamLight text-[8px] transition-width duration-1000 font-xs font-md text-white`}
                    >
                      Become An Agent
                    </h6>
                  </div>
                </a>
              </Link>
            )}

            {!!cart.length && (
              <a
                href="#FoodMenu"
                onClick={() => {
                  setShowMenu(true);
                  return;
                }}
              >
                <div className={`relative flex items-center`}>
                  <BiFoodMenu
                    className={`text-slate-100 text-lg sm:text-3xl`}
                  />
                  <div
                    className={`absolute top-[-5px] right-[-5px] w-[18px] h-[18px] text-center rounded-[50%] bg-[#e31] text-xs flex justify-center items-center text-slate-200`}
                  >
                    <span className={``}>{cart.length}</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          setShowMenu(true);
        }}
        className={`fixed bottom-6 right-5 flex items-center justify-center ${
          scrolled ? "visible opacity-1 scale-1" : "invisible opacity-0 scale-0"
        } p-0 w-12 h-12 bg-red-600 rounded-full hover:bg-red-700 active:shadow-lg mouse shadow transition-all ease-out duration-1000 focus:outline-none`}
      >
        <div className="relative">
          <BiCart className={`text-3xl text-white`} />
          {!!cart.length && (
            <div
              className={`absolute top-[-5px] right-[-5px] w-[18px] h-[18px] text-center rounded-[50%] bg-[#eee] text-xs flex justify-center items-center text-slate-800`}
            >
              <span className={``}>{cart.length}</span>
            </div>
          )}
        </div>
      </button>
      {children}
      <RightModal
        show={showMenu}
        onOutsideClicked={() => {
          setShowMenu(false);
        }}
      >
        <div className="min-h-full">
          <a
            href="#close"
            onClick={() => {
              setShowMenu(false);
            }}
          >
            <AiOutlineClose
              className={`text-xl text-slate-400 absolute right-4 top-2`}
            />
          </a>
          <h3 className={`font-gothamBold font-2xl`}>Your Food Cart</h3>
          <div className={`w-[90%] mx-auto`}>
            {cart.map((c) => {
              return (
                <FoodCart
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  img={c.imgURL}
                  price={c.price}
                  quantity={c.quantity}
                />
              );
            })}
          </div>
          <div className={`w-full flex-1 `}>
            <div className={`w-full flex flex-col items-end`}>
              <h2 className="ml-auto text-sm font-gotham">
                Total: ₵{cartTotalAmount}
              </h2>
            </div>
            <div className={`w-full flex items-center flex-between`}>
              <a
                href="#"
                onClick={() => {
                  dispatch(clearCart());
                }}
                className={`text-slate-600 hover:text-slate-700 tracking-widest text-md p-2`}
              >
                Clear All
              </a>
              <Link href="/checkout">
                <a className="w-[160px] ml-auto flex items-center cursor-pointer bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                  <AiOutlineShoppingCart className="mr-1 text-2xl text-white" />
                  <span>Checkout</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </RightModal>
      {!withoutSearch && (
        <div
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
          }}
          className={`relative w-full bg-orange-600 py-10 transition-transform duration-1000`}
        >
          <div className="absolute hidden sm:flex z-[0] translate-y-[35%] sm:translate-y-[-20%] h-[150px] flex items-center justify-between w-full">
            <div className="w-[100px] sm:w-[20%] lg:translate-y-[-20%] h-[150px] ">
              {vegetablesAnimation}
            </div>
            <div className="w-[100px] sm:w-[20%] h-[150px]">
              {beverageAnimation}
            </div>
          </div>
          <div
            className={`relative z-1 mx-auto md:max-w-[460px] xl:max-w-[620px] w-[90%] sm:w-[60%] `}
          >
            <BiSearchAlt2
              className={`text-2xl absolute text-slate-400 top-[50%] left-2 translate-y-[-50%]`}
            />
            {search != undefined && setSearch != undefined && (
              <input
                type="text"
                className={`w-full h-[45px] border border-slate-400 rounded-md outline-secondary pl-8 pr-20`}
                placeholder="Search your preferred food"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            )}

            <div className={`absolute top-0 right-5 w-10`}>{View}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
