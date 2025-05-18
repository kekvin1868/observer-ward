export const bluesky = {
  handle: process.env.BLSKY_USER,
  pass: process.env.BLSKY_APP_PASSWORD,
  token: process.env.BLSKY_TOKEN,
  feedLimit: parseInt(process.env.BLSKY_FEED_LIMIT || '10', 10)
};