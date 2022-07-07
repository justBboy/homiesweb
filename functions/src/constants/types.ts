export type orderLocationType = {
  locationStreet: string;
  locationLngLat: {
    longitude: number;
    latitude: number;
  };
};

export type distanceFromUsType = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};

export type orderType = {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
  hasRefCode?: boolean;
  failed?: boolean;
  completed?: boolean;
  viewed?: boolean;
  location?: orderLocationType;
  distanceFromUs?: distanceFromUsType | null;
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

export enum notificationTypes {
  order,
}
