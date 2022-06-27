import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import {
  getFoodCategories,
  selectCategories,
} from "../features/categories/categoriesSlice";
import axios from "../libs/axios";
import Image from "next/image";

const categories = [
  {
    id: 1,
    name: "Snacks",
    img: "/images/snacks-category.jpg",
  },
  {
    id: 2,
    name: "Rice",
    img: "/images/rice-category.jpg",
  },
  {
    id: 3,
    name: "Fruits",
    img: "/images/fruits-category.jfif",
  },
  {
    id: 4,
    name: "Local Foods",
    img: "/images/local-category.jfif",
  },
  {
    id: 5,
    name: "Soft Drinks",
    img: "/images/soft-drinks-category.jfif",
  },
];

interface props {
  scrolled?: boolean;
}

const Categories: React.FC<props> = ({ scrolled }) => {
  const dispatch = useAppDispatch();
  const [active, setActive] = useState("all");
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const categories = useAppSelector(selectCategories);
  const { user, completed } = useFirebaseAuth();
  const [totalFoodCategories, setTotalFoodCategories] = useState(0);
  const [foodCategoriesLastUpdate, setFoodCategoriesLastUpdate] = useState(0);
  const [foodCategoriesLoading, setfoodCategoriesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setfoodCategoriesLoading(true);
      console.log(lastUpdateComplete);
      if (lastUpdateComplete) {
        await dispatch(
          getFoodCategories({ page: 1, lastUpdate: foodCategoriesLastUpdate })
        );
        setfoodCategoriesLoading(false);
      }
    })();
  }, [lastUpdateComplete, dispatch, foodCategoriesLastUpdate]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await axios.get("/users/foodGlobals");
      const globals: any = res.data;
      setFoodCategoriesLastUpdate(
        globals?.foodCategoriesLastUpdate?.nanoseconds || 0
      );
      setLastUpdateComplete(true);
    })();
  }, []);

  const handleChangeActive = (current: string) => {
    setActive(current);
  };

  console.log(categories);

  return (
    <div
      className={`mx-auto md:max-w-[740px] xl:max-w-[992px] rounded 2xl:max-w-[1024px] categories py-10 transition-transform duration-1000 overflow-hidden w-80% ${
        scrolled ? "translate-y-[-40px]" : "translate-y-[0px]"
      }`}
    >
      <Swiper
        modules={[Navigation]}
        style={{ overflow: "visible" }}
        spaceBetween={30}
        slidesPerView={3}
        centeredSlides
        navigation
        breakpoints={{
          640: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 5,
          },
          1340: {
            slidesPerView: 7,
          },
        }}
        className={`flex justify-between px-5 sm:px-0 sm:justify-evenly items-center flex-wrap`}
      >
        <SwiperSlide key={0}>
          <div className="flex items-center relative z-10">
            <div
              onClick={() => {
                handleChangeActive("all");
              }}
              className={`flex items-center ml-2 min-w-[130px] rounded transition-shadow transition-500 hover:cursor-pointer relative z-10 hover:shadow-xl p-2 ${
                active === "all" ? "shadow-xl" : "shadow-sm"
              }`}
            >
              <img
                src="/images/all-category.jfif"
                className="w-[50px] h-[50px] rounded-[50%]"
                alt="All Foods category"
              />
              <span className="ml-3 text-sm font-gotham text-uppercase">
                All Foods
              </span>
            </div>
          </div>
        </SwiperSlide>
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <div
              key={category.id}
              onClick={() => {
                handleChangeActive(category.name);
              }}
              className={`flex items-center ml-2 min-w-[130px] rounded transition-shadow transition-500 hover:cursor-pointer relative z-10 hover:shadow-xl p-2 ${
                active === category.name ? "shadow-xl" : "shadow-sm"
              }`}
            >
              <Image
                src={category.imgURL?.toString() || ""}
                width={50}
                height={50}
                className="rounded-[50%]"
                alt={`${category.name} category`}
              />
              <span className="ml-3 text-sm font-gotham text-uppercase">
                {category.name}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Categories;
