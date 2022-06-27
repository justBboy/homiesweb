export type orderType = {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
  failed?: boolean;
  completed?: boolean;
  items: {
    id: string;
    itemCategory: string;
    price: number;
    quantity: number;
  }[];
  createdAt: {
    nanoseconds: number;
    seconds: number;
  };
  csale?: boolean;
};
