import { onAuthStateChanged } from "firebase/auth";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { Categories, Header } from "../components";
import BottomModal from "../components/BottomModal";
import FoodItem from "../components/FoodItem";
import FoodShow from "../components/FoodShow";
import { selectUser, setUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { FoodType } from "../features/types";
import { auth } from "../libs/Firebase";
import axios from "../libs/axios";
import { getFoods, selectFoods } from "../features/foods/foodsSlice";
import { selectCarts } from "../features/cart/cartSlice";

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const { user, completed } = useFirebaseAuth();
  const [scrolled, setScrolled] = useState(false);
  const carts = useAppSelector(selectCarts);
  const [selectedFood, setSelectedFood] = useState<{
    id: string;
    name: string;
    available: boolean;
    price: number;
    img: string;
  } | null>(null);
  const foods = useAppSelector(selectFoods);
  const [page, setPage] = useState(1);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [foodsLastUpdate, setFoodsLastUpdate] = useState(0);
  const [foodsLoading, setFoodsLoading] = useState(false);

  useEffect(() => {
    const handleScrolled = (e: Event) => {
      if (window.scrollY > 0) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScrolled);

    return () => {
      window.removeEventListener("scroll", handleScrolled);
    };
  }, []);
  console.log("carts =========> ", carts);

  useEffect(() => {
    (async () => {
      setFoodsLoading(true);
      if (lastUpdateComplete) {
        await dispatch(getFoods({ page, lastUpdate: foodsLastUpdate }));
        setFoodsLoading(false);
      }
    })();
  }, [lastUpdateComplete, dispatch, page, foodsLastUpdate]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await axios.get("/users/foodGlobals");
      const globals: any = res.data;
      setFoodsLastUpdate(globals?.foodsLastUpdate?.nanoseconds || 0);
      setLastUpdateComplete(true);
    })();
  }, []);

  console.log("foods =========> ", foods);

  if (completed) {
    return (
      <div className={`w-[100vw] overflow-x-hidden min-h-[100vh] bg-graybg`}>
        <div
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
          }}
          className={`w-full transition-max-h z-10 fixed ${
            scrolled ? "max-h-[38vh]" : "max-h-[54vh]"
          } duration-1000 overflow-hidden`}
        >
          <Header scrolled={scrolled} />
          <Categories scrolled={scrolled} />
        </div>
        <section
          className={`overflow-hidden relative text-gray-700 transition-all duration-1000 foods-list ${
            scrolled ? "mt-[38vh]" : "mt-[54vh]"
          }`}
        >
          <div className={`container px-5 py-2 mx-auto lg:pt-12 lg:px-32`}>
            <h2
              className={`text-xl text-center mb-4 font-bold font-gothamThin`}
            >
              All Food Kinds
            </h2>
            <div className="sm:px-5 gap-4 grid sm:grid-cols-2 md:grid-cols-3 content-center container lg:max-w-[1512px] md:max-w-[1112px] sm:max-w-[992px] mx-auto">
              {foods.map((f) => (
                <FoodItem
                  key={f.id}
                  id={f.id}
                  available={Boolean(f.available)}
                  setSelectedFood={setSelectedFood}
                  img={(f.imgURL && f.imgURL.toString()) || ""}
                  name={f.name}
                  price={f.price}
                />
              ))}
            </div>
          </div>
          {
            <BottomModal
              show={Boolean(selectedFood)}
              onOutsideClicked={() => {
                setSelectedFood(null);
              }}
            >
              <div className={`h-full`}>
                <FoodShow selectedFood={selectedFood} />
              </div>
            </BottomModal>
          }
        </section>
      </div>
    );
  }
  return (
    <div className={`w-full h-screen flex justify-center items-center`}>
      <AiOutlineLoading className="text-2xl animate-spin" color="#111" />
    </div>
  );
};

export default Home;
