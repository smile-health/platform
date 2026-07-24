import 'i18next';

import about from '@/components/about/locales/en.json';
import assetType from '@/components/asset-type/locales/en.json';
import bast from '@/components/bast/locales/en.json';
import budgetSource from '@/components/budget-source/locales/en.json';
import distance from '@/components/distance/locales/en.json';
import entityWMS from '@/components/entity/locales/en.json';
import healthcareAsset from '@/components/healthcare-asset/locales/en.json';
import healthcarePartner from '@/components/healthcare-partner/locales/en.json';
import healthcareStorageLocation from '@/components/healthcare-storage-location/locales/en.json';
import healthCare from '@/components/healthcare/locales/en.json';
import home from '@/components/home/locales/en.json';
import logbook from '@/components/logbook/locales/en.json';
import login from '@/components/login/locales/en.json';
import manualScale from '@/components/manual-scale/locales/en.json';
import manufacture from '@/components/manufacture/locales/en.json';
import notification from '@/components/notification/locales/en.json';
import partnershipVehicle from '@/components/partnership-vehicle/locales/en.json';
import partnership from '@/components/partnership/locales/en.json';
import printLabel from '@/components/print-label/locales/en.json';
import thirdPartyPartner from '@/components/third-party-partner/locales/en.json';
import transaction from '@/components/transaction/locales/en.json';
import treatmentLocation from '@/components/treatment-location/locales/en.json';
import userActivity from '@/components/user-activity/locales/en.json';
import userOperator from '@/components/user-operator/locales/en.json';
import user from '@/components/user/locales/en.json';
import wasteClassification from '@/components/waste-classification/locales/en.json';
import wasteHierarchy from '@/components/waste-hierarchy/locales/en.json';
import wasteSource from '@/components/waste-source/locales/en.json';
import wasteSpecification from '@/components/waste-specification/locales/en.json';
import navbar from '@repo/ui/components/navbar/locales/en.json';
import transactionMonitoring from '@/components/transaction-monitoring/locales/en.json';
import userSetting from '@/components/user-setting/locales/en.json';
import assetDongle from '@/components/asset-dongle/locales/en.json';
import common from './en/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      user: typeof user;
      wasteSpecification: typeof wasteSpecification;
      wasteClassification: typeof wasteClassification;
      distance: typeof distance;
      healthCare: typeof healthCare;
      manufacture: typeof manufacture;
      entityWMS: typeof entityWMS;
      printLabel: typeof printLabel;
      wasteSource: typeof wasteSource;
      wasteHierarchy: typeof wasteHierarchy;
      login: typeof login;
      notification: typeof notification;
      navbar: typeof navbar;
      partnership: typeof partnership;
      healthcareStorageLocation: typeof healthcareStorageLocation;
      treatmentLocation: typeof treatmentLocation;
      healthcarePartner: typeof healthcarePartner;
      healthcareAsset: typeof healthcareAsset;
      thirdPartyPartner: typeof thirdPartyPartner;
      partnershipVehicle: typeof partnershipVehicle;
      userOperator: typeof userOperator;
      about: typeof about;
      transaction: typeof transaction;
      home: typeof home;
      tracking: typeof tracking;
      logbook: typeof logbook;
      manualScale: typeof manualScale;
      assetType: typeof assetType;
      budgetSource: typeof budgetSource;
      bast: typeof bast;
      userActivity: typeof userActivity;
      transactionMonitoring: typeof transactionMonitoring;
      userSetting: typeof userSetting;
      assetDongle: typeof assetDongle;
    };
  }
}
