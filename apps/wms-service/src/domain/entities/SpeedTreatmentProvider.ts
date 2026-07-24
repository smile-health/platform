export interface SpeedTreatmentLocation {
    id: number;
    name: string;
    address: string | null;
}

export interface SpeedTreatmentProviderData {
    id: number;
    name: string;
    nib: string | null;
    locations: SpeedTreatmentLocation[];
}

export default class SpeedTreatmentProvider implements SpeedTreatmentProviderData {
    public id: number;
    public name: string;
    public nib: string | null;
    public locations: SpeedTreatmentLocation[];

    constructor(data: SpeedTreatmentProviderData) {
        this.id = data.id;
        this.name = data.name;
        this.nib = data.nib;
        this.locations = data.locations;
    }
}
