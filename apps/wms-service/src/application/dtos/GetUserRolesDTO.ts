export default interface GetUserRoleDTO {
    id: number;
    updatedAt: Date;
    createdAt: Date;
    updatedBy: string;
    createdBy: string;
    name: string;
    description: string;
    regionId: number;
}
