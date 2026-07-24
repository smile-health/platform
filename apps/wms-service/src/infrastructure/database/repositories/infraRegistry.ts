type AssetManufacturerImplType = typeof import('./AssetManufacturerRepositoryImpl').default;
type AssetModelImplType = typeof import('./AssetModelRepositoryImpl').default;
type HealthcareFacilityAssetImplType = typeof import('./HealthcareFacilityAssetImpl').default;
type PartnershipOperatorMapRepoitoryImplType =
    typeof import('./PartnershipOperatorMapRepoitoryImpl').default;
type PartnershipRepositoryImplType = typeof import('./PartnershipRepositoryImpl').default;
type PartnerVehicleRepositoryImplType = typeof import('./PartnerVehicleRepositoryImpl').default;
type PartnershipVehicleMapRepoitoryImplType =
    typeof import('./PartnershipVehicleMapRepoitoryImpl').default;
type QrCodeConfigRepoitoryImplType = typeof import('./QrCodeConfigRepoitoryImpl').default;
type RegionRepositoryImplType = typeof import('./RegionRepositoryImpl').default;
type WasteBagQrCodeRepoitoryImplType = typeof import('./WasteBagQrCodeRepoitoryImpl').default;
type WasteBagTransportGroupRepositoryImplType =
    typeof import('./WasteBagTransportGroupImpl').default;
type WasteBagTreatmentGroupRepositoryImplType =
    typeof import('./WasteBagTreatmentGroupImpl').default;
type WasteBagTransportationExternalGroupImplType =
    typeof import('./WasteBagTransportExternalGroupImpl').default;
type WasteTreatmentExternalGroupImplType =
    typeof import('./WasteTreatmentExternalGroupImpl').default;
type WasteClassificationRepositoryImplType =
    typeof import('./WasteClassificationRepositoryImpl').default;
type WasteBagRepositoryImplType = typeof import('./WasteBagRepositoryImpl').default;
type WasteBagTreatmentRequestRepoitoryImplType =
    typeof import('./WasteBagTreatmentRequestRepoitoryImpl').default;
type WasteSourceRepoitoryImplType = typeof import('./WasteSourceRepoitoryImpl').default;
type WasteTransportationRequestRepoitoryImplType =
    typeof import('./WasteTransportationRequestRepoitoryImpl').default;
type ManualScaleRequestRepositoryImplType =
    typeof import('./ManualScaleRequestRepositoryImpl').default;
type S3FileServiceRepositoryImplType = typeof import('./S3FileServiceRepositoryImpl').default;
type ReportWasteBagRepositoryImplType = typeof import('./ReportWasteBagRepositoryImpl').default;

// publisher
type WasteStatusUpdatePublisherType =
    typeof import('../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher').default;
type PartnershipStatusUpdatePublisherType =
    typeof import('../../../infrastructure/queue/rabbitmq/publishers/PartnershipStatusUpdatePublisher').default;
type ManualScaleRequestPublisherType =
    typeof import('../../../infrastructure/queue/rabbitmq/publishers/ManualScaleRequestPublisher').default;

const InfraRegistry: {
    assetManufacturerRepositoryImpl?: InstanceType<AssetManufacturerImplType>;
    assetModelRepositoryImpl?: InstanceType<AssetModelImplType>;
    healthcareFacilityAssetImpl?: InstanceType<HealthcareFacilityAssetImplType>;
    partnershipOperatorMapRepoitoryImpl?: InstanceType<PartnershipOperatorMapRepoitoryImplType>;
    partnershipRepositoryImpl?: InstanceType<PartnershipRepositoryImplType>;
    partnershipVehicleMapRepoitoryImpl?: InstanceType<PartnershipVehicleMapRepoitoryImplType>;
    partnershipVehicleRepositoryImpl?: InstanceType<PartnerVehicleRepositoryImplType>;
    qrCodeConfigRepoitoryImpl?: InstanceType<QrCodeConfigRepoitoryImplType>;
    regionRepositoryImpl?: InstanceType<RegionRepositoryImplType>;
    wasteBagQrCodeRepoitoryImpl?: InstanceType<WasteBagQrCodeRepoitoryImplType>;
    wasteBagTransportGroupRepositoryImpl?: InstanceType<WasteBagTransportGroupRepositoryImplType>;
    wasteBagTreatmentGroupRepositoryImpl?: InstanceType<WasteBagTreatmentGroupRepositoryImplType>;
    wasteBagTransportationExternalGroupImpl?: InstanceType<WasteBagTransportationExternalGroupImplType>;
    wasteTreatmentExternalGroupImpl?: InstanceType<WasteTreatmentExternalGroupImplType>;
    wasteClassificationRepositoryImpl?: InstanceType<WasteClassificationRepositoryImplType>;
    wasteBagRepositoryImpl?: InstanceType<WasteBagRepositoryImplType>;
    wasteBagTreatmentRequestRepoitoryImpl?: InstanceType<WasteBagTreatmentRequestRepoitoryImplType>;
    wasteSourceRepoitoryImpl?: InstanceType<WasteSourceRepoitoryImplType>;
    wasteTransportationRequestRepoitoryImpl?: InstanceType<WasteTransportationRequestRepoitoryImplType>;
    manualScaleRequestRepositoryImpl?: InstanceType<ManualScaleRequestRepositoryImplType>;
    s3FileServiceRepositoryImpl?: InstanceType<S3FileServiceRepositoryImplType>;
    reportWasteBagRepositoryImpl?: InstanceType<ReportWasteBagRepositoryImplType>;

    // publisher
    wasteStatusUpdatePublisher?: InstanceType<WasteStatusUpdatePublisherType>;
    partnershipStatusUpdatePublisher?: InstanceType<PartnershipStatusUpdatePublisherType>;
    manualScaleRequestPublisher?: InstanceType<ManualScaleRequestPublisherType>;

    load: () => Promise<void>;
} = {
    load: async () => {
        try {
            const { default: AssetManufacturerImplType } = require(
                `./AssetManufacturerRepositoryImpl`,
            );
            InfraRegistry.assetManufacturerRepositoryImpl = new AssetManufacturerImplType();

            const { default: AssetModelImplType } = require(`./AssetModelRepositoryImpl`);
            InfraRegistry.assetModelRepositoryImpl = new AssetModelImplType();

            const { default: HealthcareFacilityAssetImplType } = require(
                `./HealthcareFacilityAssetImpl`,
            );
            InfraRegistry.healthcareFacilityAssetImpl = new HealthcareFacilityAssetImplType();

            const { default: PartnershipOperatorMapRepoitoryImplType } = require(
                `./PartnershipOperatorMapRepoitoryImpl`,
            );
            InfraRegistry.partnershipOperatorMapRepoitoryImpl =
                new PartnershipOperatorMapRepoitoryImplType();

            const { default: PartnershipRepositoryImplType } = require(
                `./PartnershipRepositoryImpl`,
            );
            InfraRegistry.partnershipRepositoryImpl = new PartnershipRepositoryImplType();

            const { default: PartnershipVehicleMapRepoitoryImplType } = require(
                `./PartnershipVehicleMapRepoitoryImpl`,
            );
            InfraRegistry.partnershipVehicleMapRepoitoryImpl =
                new PartnershipVehicleMapRepoitoryImplType();

            const { default: PartnerVehicleRepositoryImplType } = require(
                `./PartnerVehicleRepositoryImpl`,
            );
            InfraRegistry.partnershipVehicleRepositoryImpl = new PartnerVehicleRepositoryImplType();

            const { default: QrCodeConfigRepoitoryImplType } = require(
                `./QrCodeConfigRepoitoryImpl`,
            );
            InfraRegistry.qrCodeConfigRepoitoryImpl = new QrCodeConfigRepoitoryImplType();

            const { default: RegionRepositoryImplType } = require(`./RegionRepositoryImpl`);
            InfraRegistry.regionRepositoryImpl = new RegionRepositoryImplType();

            const { default: WasteBagQrCodeRepoitoryImplType } = require(
                `./WasteBagQrCodeRepoitoryImpl`,
            );
            InfraRegistry.wasteBagQrCodeRepoitoryImpl = new WasteBagQrCodeRepoitoryImplType();

            const { default: WasteBagTransportGroupRepositoryImpl } = require(
                `./WasteBagTransportGroupImpl`,
            );
            InfraRegistry.wasteBagTransportGroupRepositoryImpl =
                new WasteBagTransportGroupRepositoryImpl();

            const { default: WasteBagTreatmentGroupRepositoryImpl } = require(
                `./WasteBagTreatmentGroupImpl`,
            );
            InfraRegistry.wasteBagTreatmentGroupRepositoryImpl =
                new WasteBagTreatmentGroupRepositoryImpl();

            const { default: WasteBagTransportationExternalGroupImplType } = require(
                `./WasteBagTransportExternalGroupImpl`,
            );
            InfraRegistry.wasteBagTransportationExternalGroupImpl =
                new WasteBagTransportationExternalGroupImplType();

            const { default: WasteClassificationRepositoryImpl } = require(
                `./WasteClassificationRepositoryImpl`,
            );
            InfraRegistry.wasteClassificationRepositoryImpl =
                new WasteClassificationRepositoryImpl();

            const { default: WasteTreatmentExternalGroupImplType } = require(
                `./WasteTreatmentExternalGroupImpl`,
            );
            InfraRegistry.wasteTreatmentExternalGroupImpl =
                new WasteTreatmentExternalGroupImplType();

            const { default: WasteBagRepositoryImpl } = require(`./WasteBagRepositoryImpl`);
            InfraRegistry.wasteBagRepositoryImpl = new WasteBagRepositoryImpl();

            const { default: WasteBagTreatmentRequestRepoitoryImplType } = require(
                `./WasteBagTreatmentRequestRepoitoryImpl`,
            );
            InfraRegistry.wasteBagTreatmentRequestRepoitoryImpl =
                new WasteBagTreatmentRequestRepoitoryImplType();

            const { default: WasteSourceRepoitoryImplType } = require(`./WasteSourceRepoitoryImpl`);
            InfraRegistry.wasteSourceRepoitoryImpl = new WasteSourceRepoitoryImplType();

            const { default: WasteTransportationRequestRepoitoryImplType } = require(
                `./WasteTransportationRequestRepoitoryImpl`,
            );
            InfraRegistry.wasteTransportationRequestRepoitoryImpl =
                new WasteTransportationRequestRepoitoryImplType();

            const { default: ManualScaleRequestRepositoryImplType } = require(
                `./ManualScaleRequestRepositoryImpl`,
            );
            InfraRegistry.manualScaleRequestRepositoryImpl =
                new ManualScaleRequestRepositoryImplType();

            const { default: S3FileServiceRepositoryImplType } = require(
                `./S3FileServiceRepositoryImpl`,
            );
            InfraRegistry.s3FileServiceRepositoryImpl = new S3FileServiceRepositoryImplType();

            const { default: ReportWasteBagRepositoryImplType } = require(
                `./ReportWasteBagRepositoryImpl`,
            );
            InfraRegistry.reportWasteBagRepositoryImpl = new ReportWasteBagRepositoryImplType();

            // ======================================
            // start of publisher
            // ======================================
            const { default: WasteStatusUpdatePublisherType } = require(
                `../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher`,
            );
            InfraRegistry.wasteStatusUpdatePublisher = new WasteStatusUpdatePublisherType();

            const { default: PartnershipStatusUpdatePublisherType } = require(
                `../../../infrastructure/queue/rabbitmq/publishers/PartnershipStatusUpdatePublisher`,
            );
            InfraRegistry.partnershipStatusUpdatePublisher =
                new PartnershipStatusUpdatePublisherType();

            const { default: ManualScaleRequestPublisherType } = require(
                `../../../infrastructure/queue/rabbitmq/publishers/ManualScaleRequestPublisher`,
            );
            InfraRegistry.partnershipStatusUpdatePublisher = new ManualScaleRequestPublisherType();
            // ======================================
            // end of publisher
            // ======================================
        } catch (error) {
            console.error('Error loading InfraRegistry:', error);
            throw new Error('Failed to load InfraRegistry');
        }
    },
};

export default InfraRegistry;
