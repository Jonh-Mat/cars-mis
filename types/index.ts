import { TransmissionType } from "@prisma/client";

export enum Role {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  USER = "USER",
}

export type SearchParamsType = {
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  transmission?: TransmissionType;
  year?: string;
  page?: string | number;
  limit?: string | number;
};
