import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import { inActiveUserScheduler } from './interfaces/schedulers/jobs/inActiveUserScheduler';
import { recapEmailInActiveUserScheduler } from './interfaces/schedulers/jobs/recapEmailInActiveUserScheduler';
import { maximumTemporaryStorageDurationScheduler } from './interfaces/schedulers/jobs/maximumTemporaryStorageDurationScheduler';
import { wasteGenerationBelowMonthlyProjectionScheduler } from './interfaces/schedulers/jobs/wasteGenerationBelowMonthlyProjectionScheduler';
import { updateStatusManualWeighingApprovalScheduler } from './interfaces/schedulers/jobs/updateStatusManualWeighingApprovalScheduler';
import { cleanseAssetDongleWasteScale } from './interfaces/schedulers/jobs/CleanseAssetDongleWasteScale';

const program = new Command();

program.name('app-cli').description('CLI for worker and utility commands').version('1.0.0');

program
  .command('notif-inactive-users')
  .description('Notify inactive users')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Notifying inactive users start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await inActiveUserScheduler(entityIds && entityIds.length > 0 ? entityIds : []);

    console.log('Notification completed successfully');
    process.exit(0);
  });

program
  .command('email-inactive-users')
  .description('Email inactive users')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Email inactive users start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await recapEmailInActiveUserScheduler(entityIds && entityIds.length > 0 ? entityIds : []);

    console.log('Email completed successfully');
    process.exit(0);
  });

program
  .command('maximum-temporary-storage-duration')
  .description('Maximum temporary storage duration')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Maximum temporary storage duration start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await maximumTemporaryStorageDurationScheduler(
      entityIds && entityIds.length > 0 ? entityIds : [],
    );

    console.log('Maximum temporary storage duration completed successfully');
    process.exit(0);
  });

program
  .command('waste-generation-below-monthly-projection')
  .description('Waste generation below monthly projection')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Waste generation below monthly projection start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await wasteGenerationBelowMonthlyProjectionScheduler(
      entityIds && entityIds.length > 0 ? entityIds : [],
    );

    console.log('Waste generation below monthly projection completed successfully');
    process.exit(0);
  });

program
  .command('update-status-manual-weighing-approval')
  .description('Update status of manual weighing approvals that are past valid until date')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Update status of manual weighing approvals start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await updateStatusManualWeighingApprovalScheduler(
      entityIds && entityIds.length > 0 ? entityIds : [],
    );

    console.log('Update status of manual weighing approvals completed successfully');
    process.exit(0);
  });

program
  .command('cleanse-asset-dongle-waste-scale')
  .description('Cleanse asset dongle waste scale')
  .option('--entityIds <entityIds>', 'Comma separated Entity IDs')
  .action(async (options) => {
    console.log('Cleaning asset dongle waste scale start...');

    const entityIds = options.entityIds?.split(',').map(Number).filter(Boolean);
    await cleanseAssetDongleWasteScale(entityIds && entityIds.length > 0 ? entityIds : []);

    console.log('Cleanse asset dongle waste scale completed successfully');
    process.exit(0);
  });

program.parse(process.argv);
