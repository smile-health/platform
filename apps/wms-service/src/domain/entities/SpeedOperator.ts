export interface SpeedOperatorData {
    id: string;
    name: string | null;
    email: string | null;
    roleId: number | null;
    roleName: string | null;
    roleType: string | null;
}

export default class SpeedOperator implements SpeedOperatorData {
    public id: string;
    public name: string | null;
    public email: string | null;
    public roleId: number | null;
    public roleName: string | null;
    public roleType: string | null;

    constructor(data: SpeedOperatorData) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.roleId = data.roleId;
        this.roleName = data.roleName;
        this.roleType = data.roleType;
    }
}
