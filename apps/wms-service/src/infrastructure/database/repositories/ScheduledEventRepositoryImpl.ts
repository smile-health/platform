import { Op } from 'sequelize';
import ScheduledEvent from '../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import { ScheduledEventsModel } from '../models/ScheduledEvents';

function getNowUtc(offsetMinutes = 0) {
    const date = new Date(Date.now() + offsetMinutes * 60 * 1000);
    const pad = (n: any) => n.toString().padStart(2, '0');
    return (
        `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
        `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
    );
}

export default class ScheduledEventRepositoryImpl implements ScheduledEventRepository {
    async addEvent(event: ScheduledEvent): Promise<ScheduledEvent> {
        try {
            if (!event.eventType || !event.scheduledAt) {
                throw new Error('Event type and scheduled time are required');
            }

            console.log(event.scheduledAt, 1); // 2025-11-13T08:50:15.121Z 1

            const createEventObj = await ScheduledEventsModel.create({
                createdBy: event.createdBy || 'System',
                eventType: event.eventType,
                scheduledAt: event.scheduledAt,
                metadata: event.metadata,
                createdAt: event.createdAt || new Date(),
                status: 'PENDING',
            });

            return getEventFromModel(createEventObj);
        } catch (error) {
            console.log('Error creating event:', error);
            throw new Error(`Failed to add event`);
        }
    }

    async getEventsForProcessing(): Promise<ScheduledEvent[]> {
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const threeDaysLater = new Date(startOfToday.getTime() + 3 * 24 * 60 * 60 * 1000);

            const events = await ScheduledEventsModel.findAll({
                where: {
                [Op.or]: [
                    {
                        scheduledAt: {
                            [Op.between]: [startOfToday, threeDaysLater],
                            [Op.lte]: new Date(),
                        },
                        status: 'PENDING',
                    },
                        {
                            scheduledAt: {
                                [Op.lte]: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                            },
                            status: 'IN_PROGRESS',
                        },
                        {
                            status: 'FAILED',
                            retryLeft: {
                                [Op.gt]: 0,
                            },
                            scheduledAt: {
                                // [Op.lte]: oneHourAgo, // 1 hour
                                [Op.lte]: new Date(Date.now() - 60 * 60 * 1000),
                            },
                        },
                    ],
                },
            });

            return events.map(getEventFromModel);
        } catch (error) {
            console.log('Error fetching events for processing:', error);
            throw new Error(`Failed to fetch events for processing`);
        }
    }

    async getEventsForDailyProcessing(): Promise<ScheduledEvent[]> {
        try {
            const events = await ScheduledEventsModel.findAll({
                where: {
                    eventType: {
                        [Op.like]: `PARTNERSHIP%`,
                    },
                    [Op.or]: [
                        {
                            scheduledAt: {
                                [Op.lte]: new Date(),
                            },
                            status: 'PENDING',
                        },
                        {
                            scheduledAt: {
                                [Op.lte]: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
                            },
                            status: 'IN_PROGRESS',
                        },
                        {
                            status: 'FAILED',
                            retryLeft: {
                                [Op.gt]: 0,
                            },
                            scheduledAt: {
                                [Op.lte]: new Date(Date.now() - 60 * 60 * 1000), // 1 hour
                            },
                        },
                    ],
                },
            });

            return events.map(getEventFromModel);
        } catch (error) {
            console.log('Error fetching events for processing:', error);
            throw new Error(`Failed to fetch events for processing`);
        }
    }

    async removeEvent(id: number, deletedBy?: number): Promise<boolean> {
        try {
            if (deletedBy) await ScheduledEventsModel.update({ deletedBy }, { where: { id } });
            await ScheduledEventsModel.destroy({
                where: { id },
            });
            return true;
        } catch (error) {
            console.log('Error deleting the event:', error);
            throw new Error(`Failed to delete event`);
        }
    }

    async failEvent(id: number): Promise<boolean> {
        try {
            const event = await ScheduledEventsModel.findByPk(id);
            if (!event) {
                throw new Error(`Event with id ${id} not found`);
            }

            event.set('status', 'FAILED');
            event.set('retryLeft', (event.get('retryLeft') || 4) - 1);
            await event.save();

            return true;
        } catch (error) {
            console.log('Error failing the event:', error);
            throw new Error(`Failed to fail event`);
        }
    }

    async updateEventsForProcessing(ids: number[]): Promise<void> {
        try {
            const events = await ScheduledEventsModel.findAll({
                where: { id: { [Op.in]: ids } },
                attributes: ['id', 'eventType', 'scheduledAt'],
            });

            const now = new Date();
            const allowedIds: number[] = [];

            for (const event of events) {
                const isPartnershipEvent =
                    event.dataValues.eventType === 'PARTNERSHIP_CONTRACT_EXPIRED';
                const scheduledAtDate = new Date(event.dataValues.scheduledAt);
                const daysRemaining = Math.ceil(
                    (scheduledAtDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
                );

                if (!isPartnershipEvent) {
                    // semua non-partnership event boleh langsung IN_PROGRESS
                    allowedIds.push(event.dataValues.id as number);
                    continue;
                }

                if (isPartnershipEvent && daysRemaining <= 0) {
                    allowedIds.push(event.dataValues.id as number);
                }
            }

            if (allowedIds.length === 0) {
                console.log('[RABBITMQ] No eligible events for IN_PROGRESS update');
                return;
            }

            await ScheduledEventsModel.update(
                { status: 'IN_PROGRESS' },
                {
                    where: {
                        id: { [Op.in]: allowedIds },
                    },
                },
            );
        } catch (error) {
            console.log('Error updating events for processing:', error);
            throw new Error(`Failed to update events for processing`);
        }
    }
}

function getEventFromModel(event: ScheduledEventsModel): ScheduledEvent {
    const result = event.get({ plain: true });

    return new ScheduledEvent({
        id: result.id ?? event.id,
        createdBy: result.createdBy,
        eventType: result.eventType,
        scheduledAt: result.scheduledAt,
        metadata: result.metadata,
        createdAt: result.createdAt,
        status: result.status,
        retryLeft: result.retryLeft,
    });
}
