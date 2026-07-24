import WasteBagModel from '../../infrastructure/database/models/WasteBagModel';

export function getTotalWeightFromWasteBags(wasteBags: WasteBagModel[]): number {
    if (!wasteBags.length) {
        return 0;
    }
    var totalWeight = 0;
    wasteBags.forEach((wasteBag) => {
        const rawWeight = wasteBag.get('weightInKgs');
        const weight = Number(rawWeight);

        if (isNaN(weight) || weight <= 0) {
            throw new Error(`Invalid weight value: ${rawWeight}`);
        }

        totalWeight += weight;
    });
    return totalWeight;
}
