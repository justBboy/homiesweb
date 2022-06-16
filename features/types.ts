export type FoodType = {
  name: string;
  price: number;
  img: string;
};

export type userType = {
  uid: string;
  email: string;
  username: string;
  phone: string;
  isAgent?: boolean;
};

export type categoryType = {
  id: string;
  imgURL: string;
  name: string;
};
