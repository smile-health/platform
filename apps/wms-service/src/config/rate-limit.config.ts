export default {
    THRESHOLD: Number(process.env.RATE_LIMIT_THRESHOLD?.toString()) || 500,
    WINDOW_IN_SECONDS: Number(process.env.RATE_LIMIT_WINDOW?.toString()) || 60,
};
