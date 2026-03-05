export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "168h", // 7 dias
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "365d" // 1 ano
};
