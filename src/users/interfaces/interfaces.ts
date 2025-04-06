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
  contactPhone: string,
  role?: string
}