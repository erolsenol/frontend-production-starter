export type FeatureFlag = "advanced-dashboard" | "audit-log-export" | "organization-switcher";
export type FeatureFlagSet = Readonly<Partial<Record<FeatureFlag, boolean>>>;
export const isEnabled = (flags: FeatureFlagSet, flag: FeatureFlag): boolean => flags[flag] === true;
