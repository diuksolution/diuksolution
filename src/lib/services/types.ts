export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  dpAmount: number;
  durationMin: number | null;
  isActive: boolean;
  sortOrder: number;
  practitioners: Array<{ id: string; name: string }>;
  practitionerIds: string[];
};

export type ServiceInput = {
  name: string;
  description?: string | null;
  price: number;
  dpAmount?: number;
  durationMin?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  practitionerIds?: string[];
};
