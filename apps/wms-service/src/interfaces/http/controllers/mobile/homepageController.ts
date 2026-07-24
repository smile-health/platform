import { Request, Response } from 'express';
import WasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import GetAllWasteBagUseCase from '../../../../application/use-cases/GetAllWasteBag';
import ReportWasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/ReportWasteBagRepositoryImpl';
import GetWasteBagSummaryByCharacteristicsUseCase from '../../../../application/use-cases/waste-bag/GetWasteBagSummaryByCharacteristics';
import {
    formatTitleCase,
    getBFFWasteBagStorageDate,
    getWasteSourceName,
} from '../../../../shared/utils/formating';
import { getBFFWasteStatusFromWMSWasteStatus } from '../../../../shared/types/bffWasteStatus';
import { WasteSourceAttributes } from '../../../../infrastructure/database/models/WasteSourceModel';

export async function getDataHomePage(req: Request, res: Response): Promise<void> {
    try {
        const {
            startDate,
            endDate,
            wasteType,
            wasteGroup,
            wasteCharacteristics,
            wasteTreatment,
            query,
            search,
            page,
            limit,
        } = req.query;

        const {
            // limit,
            // page,
            // search,
            healthcareId,
            transporterId,
            thirdPartyId,
            wasteUpdateStart,
            wasteUpdateEnd,
            wasteClassificationId,
            transportationGroupId,
            transportationExternalGroupId,
            treatmentGroupId,
            treatmentExternalGroupId,
            sourceType,
            ownedBy,
            wasteStatus,
            binNumber,
            wasteBagQrCodeId,
            id,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isTreated,
            isDisposed,
        } = req.query;

        const repo = new WasteBagRepositoryImpl();
        const useCase = new GetAllWasteBagUseCase(repo);

        const repoReport = new ReportWasteBagRepositoryImpl();
        const useCaseReport = new GetWasteBagSummaryByCharacteristicsUseCase(repoReport);

        let entityType = req.user?.entity.entity_type.name;
        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');
        let entityTag = req.user?.entity.tag.toString();
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (allowedTypes.includes(entityType) && !isSuperAdmin) {
            entityTag = 'hospital';
        }

        const recaptData = await useCaseReport.execute(
            100,
            1,
            startDate?.toString() as string,
            endDate?.toString() as string,
            false,
            req.user?.entity.id,
        );

        const wasteBag = await useCase.execute(
            limit ? Number(limit?.toString()) : 30,
            page ? Number(page) : 1,
            search?.toString(),
            healthcareId ? Number(healthcareId?.toString()) : req.user?.entity.id,
            transporterId ? Number(transporterId?.toString()) : req.user?.entity.id,
            thirdPartyId ? Number(thirdPartyId?.toString()) : req.user?.entity.id,
            wasteUpdateStart ? wasteUpdateStart?.toString() : startDate?.toString(),
            wasteUpdateEnd ? wasteUpdateEnd?.toString() : endDate?.toString(),
            wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
            Number(transportationGroupId?.toString()),
            Number(transportationExternalGroupId?.toString()),
            Number(treatmentGroupId?.toString()),
            Number(treatmentExternalGroupId?.toString()),
            sourceType?.toString(),
            ownedBy?.toString(),
            wasteStatus ? wasteStatus?.toString() : wasteTreatment?.toString().toUpperCase(),
            binNumber?.toString(),
            wasteBagQrCodeId?.toString(),
            Number(id?.toString()),
            wasteTypeId ? Number(wasteTypeId?.toString()) : Number(wasteType?.toString()),
            wasteGroupId ? Number(wasteGroupId?.toString()) : Number(wasteGroup?.toString()),
            wasteCharacteristicsId
                ? Number(wasteCharacteristicsId?.toString())
                : Number(wasteCharacteristics?.toString()),
            isTreated?.toString() === 'true',
            isDisposed?.toString() === 'true',
            entityTag,
            req.user?.entity.id,
            true
        );

        const acceptLang = req.headers['accept-language'];
        const isID = acceptLang?.toLowerCase() === 'id'

        const bffWasteRecap = recaptData
            ? recaptData.data.map((item) => ({
                  type: isID ? `${item.wasteCharacteristicsName}` : `${item.wasteCharacteristicsNameEn}`,
                  weight: parseFloat(item.totalWeightInKgs?.toString() ?? ''),
                  unit: 'kg',
                  transactionCount: item.totalWasteBag,
                  manualWeight: parseFloat(item.manualWeightInKgs?.toString() ?? ''),
                  manualBagsCount: item.manualWasteBagCount,
                  iotWeight: parseFloat(item.iotWeightInKgs?.toString() ?? ''),
                  iotBagsCount: item.iotWasteBagCount
              }))
            : [];

        res.success({
            locationName: req.user?.entity.name,
            user: {
                name: [req.user?.firstname, req.user?.lastname]
                    .filter(Boolean)
                    .join(' '),
                languagePreference: 'EN',
            },
            wasteRecap: bffWasteRecap,
            transactions: {
                pagination: {
                    page: wasteBag.pagination.currentPage,
                    limit: wasteBag.pagination.perPage,
                    totalItems: wasteBag.pagination.total,
                    totalPages: wasteBag.pagination.pages,
                },
                data: wasteBag.data.map((source) => {
                    const wasteType = source.wasteClassification?.wasteType;
                    const wasteGroup = source.wasteClassification?.wasteGroup;
                    const wasteCharacteristic = source.wasteClassification?.wasteCharacteristics;
                    const disposalMethod = source.wasteClassification?.disposalMethod;

                    let weight = 0;

                    // Make sure parsing weight is safe
                    if (source.weightInKgs) {
                        const parsedWeight = parseFloat(source.weightInKgs.toString());
                        if (!isNaN(parsedWeight)) {
                            weight = parsedWeight;
                        }
                    }

                    return {
                        id: source.wasteBagQrCodeId,
                        date: source.createdAt,
                        classification: {
                            wasteType: {
                                id: wasteType.id.toString(),
                                label: wasteType.name,
                                labelEn: wasteType.nameEn,
                            },
                            wasteGroup: {
                                id: wasteGroup.id.toString(),
                                label: wasteGroup.name,
                                labelEn: wasteGroup.nameEn,
                            },
                            wasteCharacteristic: {
                                id: wasteCharacteristic.id.toString(),
                                label: wasteCharacteristic.name,
                                labelEn: wasteCharacteristic.nameEn,
                            },
                        },
                        treatmentStatus: '', // unused
                        wasteStatus: getBFFWasteStatusFromWMSWasteStatus(source.wasteStatus),
                        disposalMethod: disposalMethod,
                        weight: {
                            value: weight,
                            unit: 'kg',
                        },
                        storageEndDate: getBFFWasteBagStorageDate(
                            source.scheduledStorageEndDatetime?.toString(),
                        ),
                    };
                }).sort((a, b) => Number(a.classification.wasteType.id) - Number(b.classification.wasteType.id)),
            },
        });
    } catch (error) {
        console.error('Error in get data dashboard:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export async function getDetailDataHomePage(req: Request, res: Response): Promise<void> {
    try {
        const { wasteId } = req.params;

        const {
            // limit,
            // page,
            search,
            healthcareId,
            transporterId,
            thirdPartyId,
            wasteUpdateStart,
            wasteUpdateEnd,
            wasteClassificationId,
            transportationGroupId,
            transportationExternalGroupId,
            treatmentGroupId,
            treatmentExternalGroupId,
            sourceType,
            ownedBy,
            wasteStatus,
            binNumber,
            wasteBagQrCodeId,
            id,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isTreated,
            isDisposed,
        } = req.query;

        const repo = new WasteBagRepositoryImpl();
        const useCase = new GetAllWasteBagUseCase(repo);

        let entityType = req.user?.entity.entity_type.name;
        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');
        let entityTag = req.user?.entity.tag.toString();
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (allowedTypes.includes(entityType) && !isSuperAdmin) {
            entityTag = 'hospital';
        }

        const wasteBag = await useCase.execute(
            1,
            1,
            search?.toString(),
            Number(healthcareId?.toString()),
            Number(transporterId?.toString()),
            Number(thirdPartyId?.toString()),
            wasteUpdateStart?.toString(),
            wasteUpdateEnd?.toString(),
            wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
            Number(transportationGroupId?.toString()),
            Number(transportationExternalGroupId?.toString()),
            Number(treatmentGroupId?.toString()),
            Number(treatmentExternalGroupId?.toString()),
            sourceType?.toString(),
            ownedBy?.toString(),
            wasteStatus?.toString(),
            binNumber?.toString(),
            wasteId ? wasteId?.toString() : wasteBagQrCodeId?.toString(),
            Number(id?.toString()),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isTreated?.toString() === 'true',
            isDisposed?.toString() === 'true',
            entityTag,
            req.user?.entity.id,
            true
        );

        const firstSource = wasteBag.data[0];

        let result;

        if (firstSource) {
            const wasteType = firstSource.wasteClassification?.wasteType;
            const wasteGroup = firstSource.wasteClassification?.wasteGroup;
            const wasteCharacteristic = firstSource.wasteClassification?.wasteCharacteristics;
            const disposalMethod = firstSource.wasteClassification?.disposalMethod;

            let weight = 0;
            if (firstSource.weightInKgs) {
                const parsedWeight = parseFloat(firstSource.weightInKgs.toString());
                if (!isNaN(parsedWeight)) {
                    weight = parsedWeight;
                }
            }

            result = {
                id: firstSource.wasteBagQrCodeId,
                date: firstSource.createdAt,
                classification: {
                    wasteType: {
                        id: wasteType.id.toString(),
                        label: wasteType.name,
                        labelEn: wasteType.nameEn,
                    },
                    wasteGroup: {
                        id: wasteGroup.id.toString(),
                        label: wasteGroup.name,
                        labelEn: wasteGroup.nameEn,
                    },
                    wasteCharacteristic: {
                        id: wasteCharacteristic.id.toString(),
                        label: wasteCharacteristic.name,
                        labelEn: wasteCharacteristic.nameEn,
                    },
                },
                disposalMethod: disposalMethod,
                wasteSourceType: formatTitleCase(firstSource.wasteSource?.sourceType ?? 'Unknown'),
                wasteSourceName: getWasteSourceName(
                    firstSource.wasteSource as WasteSourceAttributes,
                ),
                weight: firstSource.weightInKgs ? `${firstSource.weightInKgs} kgs` : 'Not Measured',
                scaleMethod: formatTitleCase(firstSource.scaleMethod),
                treatmentStatus: getBFFWasteStatusFromWMSWasteStatus(firstSource.wasteStatus),
                wasteHistory: firstSource.logHistory.map((value: any) => {
                    return {
                        status: getBFFWasteStatusFromWMSWasteStatus(value.wasteStatus),
                        timestamp: value.wasteBagStatusUpdateDate,
                        eventCode: value.wasteAction,
                        groupId: value.groupId,
                        totalBags: value.totalBags,
                        totalWeight: value.totalWeight
                    };
                }),
                storageEndDate: getBFFWasteBagStorageDate(
                    firstSource.scheduledStorageEndDatetime?.toString(),
                ),
                processWastebagEnd: firstSource.processWastebagEnd
            };
        } else {
            res.fail(req.t('waste.error.NOT_FOUND'));
            return;
        }

        res.success(result);
    } catch (error) {
        console.error('Error in get detail data dashboard:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}
