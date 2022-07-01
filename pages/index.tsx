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
import {
  foodType,
  getFoods,
  selectFoodsWithCategory,
} from "../features/foods/foodsSlice";
import { selectCategories } from "../features/categories/categoriesSlice";
import Loader from "../components/Loader";

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const { user, completed } = useFirebaseAuth();
  const [scrolled, setScrolled] = useState(false);
  const [selectedFood, setSelectedFood] = useState<{
    id: string;
    name: string;
    available: boolean;
    price: number;
    img: string;
  } | null>(null);
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [foodsLastUpdate, setFoodsLastUpdate] = useState(0);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [changeCategoryLoading, setChangeCategoryLoading] = useState(false);
  const [categoryActive, setCategoryActive] = useState("");
  const [search, setSearch] = useState("");
  const foods = useAppSelector(selectFoodsWithCategory(categoryActive));
  const [scrollBottom, setScrollBottom] = useState(0);
  const categories = useAppSelector(selectCategories);
  const [error, setError] = useState("");
  const [searchFoods, setSearchFoods] = useState<foodType[]>([]);
  const [searchTimer, setSearchTimer] = useState<{ timer: any; last: number }>({
    timer: undefined,
    last: 0,
  });

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

  useEffect(() => {
    (async () => {
      setChangeCategoryLoading(true);
      if (lastUpdateComplete) {
        await dispatch(
          getFoods({
            page,
            lastUpdate: foodsLastUpdate,
            category: categoryActive,
          })
        );
      }
      setChangeCategoryLoading(false);
    })();
  }, [lastUpdateComplete, dispatch, page, foodsLastUpdate, categoryActive]);

  useEffect(() => {
    if (search) {
      (async () => {
        if (setFoodsLoading) setFoodsLoading(true);
        if (Date.now() - searchTimer.last < 3 * 1000) {
          if (searchTimer.timer) clearTimeout(searchTimer.timer);
        }
        let timer = setTimeout(async () => {
          const searchRes = await axios.get(
            `/users/searchFood?s=${search}&page=${page}`
          );
          if (setFoodsLoading) setFoodsLoading(false);
          if (searchRes.data.error) return setError(searchRes.data.error);
          setSearchFoods(searchRes.data);
        }, 1000);
        setSearchTimer({
          last: Date.now(),
          timer: timer,
        });
      })();
    } else {
      setSearchFoods([]);
    }
  }, [search]);

  useEffect(() => {
    if (
      scrollBottom === 0 ||
      scrollBottom <
        (document.querySelector("html") as HTMLElement).scrollHeight
    )
      return;

    if (foodsLoading) return;
    (async () => {
      setFoodsLoading(true);
      await dispatch(
        getFoods({
          page,
          lastUpdate: foodsLastUpdate,
          category: categoryActive,
        })
      );
      setFoodsLoading(false);
    })();
  }, [scrollBottom]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await axios.get("/users/foodGlobals");
      const globals: any = res.data;
      setFoodsLastUpdate(globals?.foodsLastUpdate);
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", changeScrollBottom);
    return () => {
      window.removeEventListener("scroll", changeScrollBottom);
    };
  }, []);

  const changeScrollBottom = () => {
    setScrollBottom(
      (document.querySelector("html") as HTMLElement).scrollTop +
        (document.querySelector("html") as HTMLElement).clientHeight || 0
    );
  };

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
          <Header
            foodsLoading={foodsLoading}
            setFoodsLoading={setFoodsLoading}
            scrolled={scrolled}
            search={search}
            setSearch={setSearch}
          />
          <Categories
            changeCategoryLoading={changeCategoryLoading}
            setChangeCategoryLoading={setChangeCategoryLoading}
            active={categoryActive}
            setActive={setCategoryActive}
            scrolled={scrolled}
          />
        </div>
        <section
          className={`overflow-hidden relative text-gray-700 transition-all duration-1000 foods-list ${
            scrolled ? "mt-[38vh]" : "mt-[54vh]"
          }`}
        >
          {changeCategoryLoading ? (
            <div className={`w-full flex justify-center mt-10`}>
              <Loader />
            </div>
          ) : (
            <div className={`container px-5 py-2 mx-auto lg:pt-12 lg:px-32`}>
              {!categoryActive ? (
                <h2
                  className={`animate__animated animate__fadeIn text-xl text-center mb-4 font-bold font-gothamThin`}
                >
                  {!search ? "All Food Kinds" : search}
                </h2>
              ) : (
                <h2
                  className={`animate__animated animate__fadeIn text-xl text-center mb-4 font-bold font-gothamThin`}
                >
                  {categories.find((c) => c.id === foods.categoryId)?.name ||
                    "All"}
                </h2>
              )}
              <div className="sm:px-5 gap-4 grid sm:grid-cols-2 md:grid-cols-3 container lg:max-w-[1512px] md:max-w-[1112px] sm:max-w-[992px] mx-auto pb-5">
                {!!searchFoods.length &&
                  searchFoods?.map((f) => (
                    <FoodItem
                      key={f.id}
                      id={f.id}
                      includes={f.includes}
                      available={Boolean(f.available)}
                      setSelectedFood={setSelectedFood}
                      img={(f.imgURL && f.imgURL.toString()) || ""}
                      name={f.name}
                      price={f.price}
                    />
                  ))}
                {!search &&
                  !searchFoods.length &&
                  foods?.items?.map((f) =>
                    f ? (
                      <FoodItem
                        key={f.id}
                        id={f.id}
                        includes={f.includes}
                        available={Boolean(f.available)}
                        setSelectedFood={setSelectedFood}
                        img={(f.imgURL && f.imgURL.toString()) || ""}
                        name={f.name}
                        price={f.price}
                      />
                    ) : null
                  )}
              </div>
              {foodsLoading && (
                <div className={`w-full flex justify-center mt-10`}>
                  <Loader />
                </div>
              )}
            </div>
          )}

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
      <Loader />
    </div>
  );
};

export default Home;
