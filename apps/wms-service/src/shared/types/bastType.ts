export interface BastBody {
    bast_no: string;
    disposal_comments: string;
    instruction_type_id: number;
    instruction_type_label: string;
    sender: Sender;
    disposal_items: DisposalItem[];
    user_created_by: UserCreatedBy;
    created_at: string;
    updated_at: string;
}

export interface Sender {
    address: string;
    entity_id: number;
    entity_name: string;
    province_name: string;
    regency_name: string;
    status: number;
    type: number;
    type_label: string;
}

export interface DisposalItem {
    material_id: number;
    material_name: string;
    qty: number;
}

export interface UserCreatedBy {
    email: string;
    firstname: string;
    lastname: string;
    username: string;
    user_uuid: string;
}
