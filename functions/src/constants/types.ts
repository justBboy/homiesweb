export type orderType = {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
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
