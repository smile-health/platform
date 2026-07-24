export function handleAnalisisProcessCount(
    disposal?: string,
    treatment?: string | null,
    isTreated?: boolean,
    groupsIds?: string,
    status?: string
) {
    const hasTreatment = !!treatment && treatment.trim() !== '';
    const disposalSet = new Set(disposal ? disposal.split(',').map((d) => d.trim()) : []);

    const treatmentSet = new Set(treatment ? treatment.split(',').map((d) => d.trim()) : []);

    // Rule 4: INTERNAL_LANDFILL
    if (!isTreated && treatmentSet?.has('INTERNAL_LANDFILL') && treatmentSet?.has('PYROLYSIS')) {
        return ['IN_TEMPORARY_STORAGE', 'INCINERATED', 'INTERNAL_LANDFILLED'];
    }

    if (!isTreated && treatmentSet?.has('INTERNAL_LANDFILL') && !treatmentSet?.has('PYROLYSIS')) {
        return ['IN_TEMPORARY_STORAGE', 'INTERNAL_LANDFILLED'];
    }

    if (!hasTreatment && disposalSet.has('SPECIALIZED_TREATMENT_PROVIDER')) {
        return [
            'IN_TEMPORARY_STORAGE',
            'IN_TRANSIT',
            'COLLECTED',
        ];
    }

    if (!hasTreatment && disposalSet.has('TRANSPORTER_GOVERNMENT')) {
        return [
            'IN_TEMPORARY_STORAGE',
            'IN_TRANSIT',
            'DISPOSED',
        ];
    }

    if (!hasTreatment && disposalSet.has('TRANSPORTER_GOVERNMENT_WASTE_BANK')) {
        return [
            'IN_TEMPORARY_STORAGE',
            'IN_TRANSIT',
            'READY_FOR_TREATMENT',
            'DISPOSED',
        ];
    }

    // Rule 1 > khusus 2 process
    if (
        hasTreatment &&
        (disposalSet.has('TRANSPORTER_RECYCLER') ||
            disposalSet.has('TRANSPORTER_LANDFILL'))
    ) {
        // 2 process
        if (treatmentSet.has('DISINFECTION') && disposalSet.has('TRANSPORTER_RECYCLER')) {
            return ['IN_TEMPORARY_STORAGE', 'STERILISED', 'IN_TRANSIT', 'RECYCLED'];
        }

        // 2 process
        if (
            treatmentSet.has('PYROLYSIS') &&
            disposalSet.has('TRANSPORTER_LANDFILL') &&
            isTreated &&
            groupsIds &&
            groupsIds?.length > 0
        ) {
            return [
                'IN_TEMPORARY_STORAGE',
                'INCINERATED',
                'IN_TRANSIT',
                'READY_FOR_TREATMENT',
                'LANDFILLED',
            ];
        }

        // 3 process
        if (
            treatmentSet.has('PYROLYSIS') &&
            disposalSet.has('TRANSPORTER_LANDFILL') &&
            !isTreated &&
            !groupsIds
        ) {
            return ['IN_TEMPORARY_STORAGE', 'IN_TRANSIT', 'READY_FOR_TREATMENT', 'LANDFILLED'];
        }
    }

    if (!hasTreatment && disposalSet.has('TRANSPORTER_RECYCLER') && isTreated && groupsIds && groupsIds?.length > 0) {
        return ['IN_TEMPORARY_STORAGE', 'STERILISED', 'IN_TRANSIT', 'RECYCLED'];
    }

    // 3 process
    if (disposalSet.has('GOVERNMENT_WASTE_TRANSPORT')) {
        return [
            'IN_TEMPORARY_STORAGE',
            // 'STERILISED/INCINERATED',
            'IN_TRANSIT',
            'READY_FOR_TREATMENT',
            'DISPOSED',
        ];
    }

    // Rule 2 > ke thrid party
    if (!hasTreatment && disposalSet.has('TRANSPORTER_TREATMENT')) {
        return ['IN_TEMPORARY_STORAGE', 'IN_TRANSIT', 'READY_FOR_TREATMENT', 'LANDFILLED'];
    }

    // Rule 3 > ke thrid party > 3 process
    if (hasTreatment && disposalSet.has('TRANSPORTER_TREATMENT')) {
        if (isTreated && groupsIds && groupsIds?.length > 0) {
            if (treatmentSet.has('PYROLYSIS')) {
                return [
                    'IN_TEMPORARY_STORAGE',
                    'INCINERATED',
                    'IN_TRANSIT',
                    'READY_FOR_TREATMENT',
                    'LANDFILLED',
                ];
            }

            if (treatmentSet.has('DISINFECTION')) {
                return [
                    'IN_TEMPORARY_STORAGE',
                    'STERILISED',
                    'IN_TRANSIT',
                    'READY_FOR_TREATMENT',
                    'RECYCLED',
                ];
            }
        } else {
            if (treatmentSet.has('PYROLYSIS')) {
                return ['IN_TEMPORARY_STORAGE', 'IN_TRANSIT', 'READY_FOR_TREATMENT', 'LANDFILLED'];
            }

            if (treatmentSet.has('DISINFECTION')) {
                return ['IN_TEMPORARY_STORAGE', 'IN_TRANSIT', 'READY_FOR_TREATMENT', 'RECYCLED'];
            }
        }
    }
}
