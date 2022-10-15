import type { User } from "../shared/user";

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;
}
