export type orderType = {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
  hasRefCode?: boolean;
  failed?: boolean;
  completed?: boolean;
  items: {
    id: string;
    itemCategory: string;
    price: number;
    quantity: number;
  }[];
  createdAt:
    | {
        nanoseconds: number;
        seconds: number;
      }
    | any;
  csale?: boolean;
};

export type foodType = {
  id: string;
  name: string;
  includes?: string[];
  price: number;
  available?: boolean;
  category: string;
  imgURL: string | ArrayBuffer | null | undefined;
};

export enum paymentMethods {
  manual = 1,
  electronic,
}
