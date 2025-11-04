import { UserRepository, CreateUserData } from '@/repositories/user.repository';
import { ConflictError, NotFoundError } from '@shared/errors/AppError';
import { logger } from '@shared/utils/logger';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserData) {
    // Check if user exists
    const exists = await this.userRepository.exists(data.email);
    if (exists) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await this.userRepository.create(data);
    
    // Don't return password
    return user.getPublicProfile();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findByIdOrFail(id);
    return user.getPublicProfile();
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User', email);
    }
    return user;
  }

  async listUsers(page: number, limit: number, filters = {}) {
    const { users, total } = await this.userRepository.findAll(filters, page, limit);
    
    return {
      users: users.map(u => u.getPublicProfile()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(id: string, data: { name?: string; avatar?: string }) {
    const user = await this.userRepository.update(id, data);
    return user.getPublicProfile();
  }

  async deleteUser(id: string) {
    await this.userRepository.delete(id);
    logger.info({ userId: id }, 'User deleted by admin');
  }

  async verifyEmail(userId: string) {
    return await this.userRepository.update(userId, { isEmailVerified: true });
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundError('User', email);
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user._id);

    return user.getPublicProfile();
  }
}