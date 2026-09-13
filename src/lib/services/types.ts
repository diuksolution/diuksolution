export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  dpAmount: number;
  durationMin: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type ServiceInput = {
  name: string;
  description?: string | null;
  price: number;
  dpAmount?: number;
  durationMin?: number | null;
  isActive?: boolean;
  sortOrder?: number;
};
