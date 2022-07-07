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
import { BiCategory } from "react-icons/bi";
import CenterModal from "./CenterModal";

interface props {
  active: string;
  setActive: (val: string) => void;
  scrolled?: boolean;
  changeCategoryLoading?: boolean;
  setChangeCategoryLoading?: (val: boolean) => void;
}

const Categories: React.FC<props> = ({
  scrolled,
  active,
  setActive,
  changeCategoryLoading,
  setChangeCategoryLoading,
}) => {
  const dispatch = useAppDispatch();
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const categories = useAppSelector(selectCategories);
  const { user, completed } = useFirebaseAuth();
  const [totalFoodCategories, setTotalFoodCategories] = useState(0);
  const [foodCategoriesLastUpdate, setFoodCategoriesLastUpdate] = useState(0);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [foodCategoriesLoading, setfoodCategoriesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setfoodCategoriesLoading(true);
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
      setFoodCategoriesLastUpdate(globals?.foodCategoriesLastUpdate || 0);
      setLastUpdateComplete(true);
    })();
  }, []);

  const handleChangeActive = (current: string) => {
    setActive(current);
  };

  return (
    <>
      <div
        className={`mx-auto md:max-w-[740px] xl:max-w-[992px] rounded 2xl:max-w-[1024px] categories py-1 sm:py-10 transition-transform duration-1000 overflow-hidden w-80% ${
          scrolled ? "translate-y-[-40px]" : "translate-y-[0px]"
        }`}
      >
        <Swiper
          modules={[Navigation]}
          style={{ overflow: "visible" }}
          spaceBetween={30}
          slidesPerView={3}
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
          className={`categories-swiper w-full px-5 sm:px-0`}
        >
          <SwiperSlide key={0}>
            <div className="flex items-center relative z-10">
              <div
                onClick={() => {
                  handleChangeActive("");
                }}
                className={`flex items-center justify-center flex-col ml-2 min-w-[150px] w-auto rounded transition-shadow transition-500 hover:cursor-pointer relative z-10 hover:shadow-xl p-2 ${
                  active === "" ? "shadow-xl" : "shadow-sm"
                }`}
              >
                <Image
                  src="/v1656685118/all-category_sy0ogy.jpg"
                  width={50}
                  height={50}
                  className="w-[50px] h-[50px] rounded-[50%]"
                  alt="All Foods category"
                />
                <span className="text-sm font-gotham whitespace-nowrap text-uppercase text-white">
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
                  handleChangeActive(category.id);
                }}
                className={`flex justify-center flex-col items-center ml-2 min-w-[150px] w-auto rounded transition-shadow transition-500 hover:cursor-pointer relative z-10 hover:shadow-xl p-2 ${
                  active === category.id ? "shadow-xl" : "shadow-sm"
                }`}
              >
                <Image
                  src={category.imgURL?.toString() || ""}
                  width={50}
                  height={50}
                  loader={({ src }) => {
                    return src;
                  }}
                  className="rounded-[50%]"
                  alt={`${category.name} category`}
                />
                <span className="text-sm whitespace-nowrap font-gotham text-uppercase text-white">
                  {category.name}
                </span>
              </div>
            </SwiperSlide>
          ))}
          {categories.length > 10 && (
            <button
              onClick={() => {
                setShowCategoriesModal(true);
              }}
              className={`absolute right-0 top-[-10px] z-20 text-white`}
            >
              <BiCategory className={`text-2xl`} />
            </button>
          )}
        </Swiper>
      </div>
      <CenterModal
        show={showCategoriesModal}
        onOutsideClicked={() => {
          setShowCategoriesModal(false);
        }}
      >
        <div className={`w-full min-h-[40vh] max-h-[60vh] overflow-y-auto`}>
          <h2 className={`font-bold text-sm text-center sm:text-xl`}>
            All Categories
          </h2>
          <hr className={`mt-3`} />
          <div className={`flex flex-wrap justify-center h-full items-center`}>
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  handleChangeActive(category.id);
                  setShowCategoriesModal(false);
                }}
                className={`flex items-center ml-2 min-w-[150px] w-auto rounded transition-shadow transition-500 hover:cursor-pointer relative z-10 hover:shadow-xl p-2 ${
                  active === category.id ? "shadow-xl" : "shadow-sm"
                }`}
              >
                <Image
                  src={category.imgURL?.toString() || ""}
                  width={50}
                  height={50}
                  className="rounded-[50%]"
                  alt={`${category.name} category`}
                />
                <span className="ml-3 text-sm whitespace-nowrap font-gotham text-uppercase text-slate-800">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CenterModal>
    </>
  );
};

export default Categories;
