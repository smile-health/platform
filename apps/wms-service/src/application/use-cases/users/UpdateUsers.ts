
import Users from '../../../domain/entities/Users';
import UsersRepository from '../../../domain/repositories/UsersRepository';
import UsersDTO from '../../dtos/UsersDTO';

export default class UpdateUsersStatusUseCase {
    constructor(private readonly repo: UsersRepository) {}

    /**
     * Update user active status (is_active / active) by userId
     */
    async execute(userId: number, isActive:boolean): Promise<Users | any> {
        try {
            if (!userId) {
                return 'User ID is required to update active status';
            }

            const existingUser = await this.repo.getUsersId(userId);
            if (!existingUser) {
                return `User with ID ${userId} not found`;
            }
            console.log(isActive);
            // Update only the is_active field
            const updatedUser = await this.repo.updateUsersStatus(userId, {
                is_active: isActive,
            } as Users);

            console.log(`User active status updated successfully:`, updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user active status:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
