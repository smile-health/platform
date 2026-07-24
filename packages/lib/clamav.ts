import NodeClam from "clamscan";

let clamav: NodeClam | undefined;

export const getClamav = async () => {
  if (!clamav) {
    try {
      clamav = await new NodeClam().init({
        clamdscan: {
          host: process.env.CLAMAV_HOST,
          port: Number(process.env.CLAMAV_PORT),
          timeout: 60000,
          localFallback: false,
        },
      });
    } catch (e) {
      console.error("failed to init clamav", e);
    }
  }
  return clamav;
};
