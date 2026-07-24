import amqp from 'amqplib';
import rabbitmqConfig from '../../../config/rabbitmq.config';
import { registerRabbitListeners } from '../../../interfaces/consumers/rabbitmq/registerlisteners';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.ConfirmChannel | null = null;
let attempReconnect = 0;
let isReconnecting = false;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectRabbitMQ() {
  if (connection && channel) return channel;

  try {
    connection = await amqp.connect(rabbitmqConfig.HOST);
    console.log('[RABBITMQ] Connection established successfully');

    channel = await connection.createConfirmChannel();
    console.log('[RABBITMQ] Confirm channel created successfully');

    await channel.assertExchange(rabbitmqConfig.EXCHANGE, 'direct', { durable: true });

    // Setup queues
    const queues = [
      rabbitmqConfig.WASTE_STATUS_UPDATE,
      rabbitmqConfig.MANUAL_SCALE_REQUEST_STATUS,
      rabbitmqConfig.PARTNERSHIP_STATUS_UPDATE,
      rabbitmqConfig.SCHEDULED_EVENTS,
    ];

    for (const q of queues) {
      await channel.assertQueue(q.QUEUE_NAME, { durable: true });
      await channel.bindQueue(q.QUEUE_NAME, rabbitmqConfig.EXCHANGE, q.ROUTING_KEY);
    }

    connection.on('close', async () => {
      console.error('[RABBITMQ] Connection closed, reconnecting...');
      connection = null;
      channel = null;
      await reconnectRabbitMQ();
    });

    connection.on('error', async (err) => {
      console.error('[RABBITMQ] Connection error:', err);
      connection = null;
      channel = null;
    });

    registerRabbitListeners();

    return channel;
  } catch (err) {
    console.error('[RABBITMQ] Connection failed:', err);
    connection = null;
    channel = null;
    await reconnectRabbitMQ();
  }
}

let offlineQueue: any[] = [];

export async function publishMessage(exchange: string, routingKey: string, data: any) {
  try {
    const ch = getChannel();
    ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
    await ch.waitForConfirms();
    console.log('[RABBITMQ] Message published');
  } catch (err) {
    console.warn('[RABBITMQ] Failed to publish, caching message locally:', err);
    offlineQueue.push({ exchange, routingKey, data });
  }
}

async function reconnectRabbitMQ() {
  if (isReconnecting) return;
  isReconnecting = true;

  while (!connection) {
    try {
      attempReconnect++;
      console.log(`[RABBITMQ] Reconnecting in 5s (attempt ${attempReconnect})`);

      await delay(5000);
      await connectRabbitMQ();
    } catch (err) {
      console.error('[RABBITMQ] Reconnect attempt failed:', err);
    }
  }

  isReconnecting = false;
  console.log('[RABBITMQ] Reconnected successfully');
}

export function getChannel(): amqp.ConfirmChannel {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  return channel;
}
