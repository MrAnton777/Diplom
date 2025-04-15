import { UserDocument } from "../schemas/users.schema";
import { ID } from "src/types/types";

export interface SearchUserParams {
    limit: number;
    offset: number;
    email: string;
    name: string;
    contactPhone: string;
  }

export interface createUserDto{
  email: string,
  password: string,
  name: string,
  contactPhone?: string,
  role?: string
}

export interface IUserService {
  create(data: Partial<UserDocument>): Promise<UserDocument>;
  findById(id: ID): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument>;
  findAll(params: SearchUserParams): Promise<UserDocument[]>;
}