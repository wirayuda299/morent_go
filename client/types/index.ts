type Thumbnail = {
  public_id: string;
  url: string;
};

export type Car = {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  fuelTankSize: number;
  location: string;
  capacity: number;
  owner: string;
  transmission: string;
  thumbnails: Thumbnail[];
  is_favorite: boolean;
  features: string[];
};
