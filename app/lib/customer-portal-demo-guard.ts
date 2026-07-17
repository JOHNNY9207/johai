export function isCustomerPortalDemoAvailable(
  environment = process.env.NODE_ENV
) {
  return environment === "development" || environment === "test";
}
