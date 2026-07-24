export default class DisposalItems {
    public id: number | undefined;
    public materialId: number;
    public bastNo: string;
    public materialName: string;
    public qty: number;

    constructor(data: {
        id?: number;
        materialId: number;
        bastNo: string;
        materialName: string;
        qty: number;
    }) {
        this.id = data.id;
        this.materialId = data.materialId;
        this.bastNo = data.bastNo;
        this.materialName = data.materialName;
        this.qty = data.qty;
    }
}

export class DisposalItemsSmile {
    public id: number | undefined;
    public material_id: number;
    public name: string;
    public qty: number;
    public waste_info?: any; 

    constructor(data: {
        id?: number;
        material_id: number;
        name: string;
        qty: number;
        waste_info?: any;
    }) {
        this.id = data.id;
        this.material_id = data.material_id;
        this.name = data.name;
        this.qty = data.qty;
        this.waste_info = this.waste_info;
    }
}


