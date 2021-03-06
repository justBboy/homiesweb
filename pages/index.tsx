import { onAuthStateChanged } from "firebase/auth";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Categories, Header } from "../components";
import BottomModal from "../components/BottomModal";
import FoodItem from "../components/FoodItem";
import FoodShow from "../components/FoodShow";
import { selectUser, setUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import { FoodType } from "../features/types";
import { auth } from "../libs/Firebase";

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [scrolled, setScrolled] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null);

  useEffect(() => {
    const handleScrolled = (e: Event) => {
      if (window.scrollY > 0) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScrolled);

    onAuthStateChanged(auth, (user) => {
      if (user)
        dispatch(setUser({ phone: user.phoneNumber, email: user.email }));
      else dispatch(setUser(null));
    });
    return () => {
      window.removeEventListener("scroll", handleScrolled);
    };
  }, []);
  console.log(user);
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
          <h2 className={`text-xl text-center mb-4 font-bold font-gothamThin`}>
            All Food Kinds
          </h2>
          <div className="flex flex-wrap -m-1 md:-m-2">
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/fried-rice.jfif"
              name="Fried Rice And Chicken"
              price={25}
            />
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/Jollof-and-Chicken.jpg"
              name="Jollof and Chicken"
              price={50}
            />
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/kelewele.jfif"
              name="Kelewele"
              price={15}
            />
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/bread-sandwich.jfif"
              name="Bread Sandwich"
              price={12}
            />
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/abele.jpg"
              name="Abele Ice Cream"
              price={5}
            />
            <FoodItem
              setSelectedFood={setSelectedFood}
              img="/images/pizza.jfif"
              name="Pizza"
              price={24}
            />
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
};

export default Home;
