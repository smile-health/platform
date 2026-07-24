export default function generateWasteGroupId(
    wastebagQrCodeIds: string[],
    event:
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        | 'SPECIALIZED_TREATMENT_PROVIDER',
): string {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear()}`;
    const prefix = wastebagQrCodeIds
        .sort((a, b) => Number(a) - Number(b))
        .at(-1)?.substring(0, 4) ?? '';

    let code = '';

    switch (event) {
        // case 'TEMPORARY_STORE':
        //     code = '2IT';
        //     break;
        case 'IN_COLD_STORAGE':
            code = '-';
            break;
        case 'IN_TEMPORARY_STORAGE':
            code = '-';
            break;
        case 'INTERNAL_LANDFILL_IN_PROCESS':
            code = '3IN-';
            break;
        case 'INCINERATION_IN_PROCESS':
            code = '1IN-';
            break;
        case 'STERILIZATION_IN_PROCESS':
            code = '2IN-';
            break;
        case 'TRANSPORTER_LANDFILL':
            code = '2EX-';
            break;
        case 'TRANSPORTER_RECYCLER':
            code = '3EX-';
            break;
        case 'SPECIALIZED_TREATMENT_PROVIDER':
            code = '4EX-';
            break;
        case 'TRANSPORTER_GOVERNMENT':
            code = '5EX-';
            break;
        case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
            code = '6EX-';
            break;
        default:
            code = '1EX-';
            break;
    }

    const groupId = code + prefix + formattedDate;

    return groupId;
}
