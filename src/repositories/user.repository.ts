import { Types } from "mongoose";
import User, { IUserDocument } from "@/models/user.model";
import { NotFoundError } from "@/shared/errors/AppError";
import { logger } from "@/shared/utils/logger";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: "user" | "admin";
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  isEmailVerified?: boolean;
}

export interface UserFilters {
  role?: "user" | "admin";
  isEmailVerified?: boolean;
  search?: string;
}

export class UserRepository {
  async create(data: CreateUserData): Promise<IUserDocument> {
    try {
      const user = new User(data);
      await user.save();
      logger.info({ userId: user._id }, "User created");
      return user;
    } catch (error) {
      logger.error({ err: error, data }, "Failed to create user");
      throw error;
    }
  }

  async findById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error({ err: error, userId: id }, "Failed to find user by ID");
      throw error;
    }
  }

  async findByIdOrFail(id: string | Types.ObjectId): Promise<IUserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User", id.toString());
    }
    return user;
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findByEmail(email);
  }

  async findAll(
    filters: UserFilters = {},
    page = 1,
    limit = 10
  ): Promise<{ users: IUserDocument[]; total: number }> {
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isEmailVerified !== undefined) {
      query.isEmailVerified = filters.isEmailVerified;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }

  async update(id: string | Types.ObjectId, data: UpdateUserData): Promise<IUserDocument> {
    const user = await this.findByIdOrFail(id);

    Object.assign(user, data);
    await user.save();

    logger.info({ userId: user._id }, "User updated");
    return user;
  }

  async delete(id: string | Types.ObjectId): Promise<void> {
    const result = await User.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundError("User", id.toString());
    }

    logger.info({ userId: id }, "User deleted");
  }

  async countByRole(role: "user" | "admin"): Promise<number> {
    return User.countDocuments({ role });
  }

  async exists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }
}
