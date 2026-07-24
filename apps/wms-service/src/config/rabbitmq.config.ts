export default {
    HOST: process.env.RABBITMQ_HOST || 'localhost:5672',
    EXCHANGE: process.env.RABBITMQ_EXCHANGE || 'amq.direct',

    WASTE_STATUS_UPDATE: {
        QUEUE_NAME: process.env.RABBITMQ_WASTE_STATUS_UPDATE_QUEUE || 'waste_status_update_queue',
        ROUTING_KEY:
            process.env.RABBITMQ_WASTE_STATUS_UPDATE_LOG_ROUTING_KEY || 'waste_status_update_log',
    },

    MANUAL_SCALE_REQUEST_STATUS: {
        QUEUE_NAME:
            process.env.RABBITMQ_MANUAL_SCALE_REQUEST_STATUS_QUEUE ||
            'manual_scale_request_status_queue',
        ROUTING_KEY:
            process.env.RABBITMQ_MANUAL_SCALE_REQUEST_STATUS_LOG_ROUTING_KEY ||
            'manual_scale_request_status_log',
    },

    PARTNERSHIP_STATUS_UPDATE: {
        QUEUE_NAME:
            process.env.RABBITMQ_PARTNERSHIP_STATUS_UPDATE_QUEUE ||
            'partnership_status_update_queue',
        ROUTING_KEY:
            process.env.RABBITMQ_PARTNERSHIP_STATUS_UPDATE_LOG_ROUTING_KEY ||
            'partnership_status_update_log',
    },

    SCHEDULED_EVENTS: {
        QUEUE_NAME:
            process.env.RABBITMQ_SCHEDULED_EVENT_PROCESS_QUEUE_NAME ||
            'scheduled_event_process_queue',
        ROUTING_KEY:
            process.env.RABBITMQ_SCHEDULED_EVENT_PROCESS_ROUTING_KEY ||
            'scheduled_event_process_routing_key',
    },
};
