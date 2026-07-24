import Users from "../../../domain/entities/Users";
import UsersRepository from "../../../domain/repositories/UsersRepository";

export default class GetUsersByIdUseCase {
    constructor(private readonly repo: UsersRepository) {}

    async execute(entityId: number): Promise<Users | null> {
        try {
            const data = await this.repo.getUsersId(entityId);
            if (!data) {
                console.error(`Users with ID ${entityId} not found`);
                return null;
            }
            console.log('Users retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Users:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}