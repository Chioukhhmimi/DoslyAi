export const migration_v3 = {
  version: 3,
  up: [
    // Per-dose notes on intake records (H2)
    `ALTER TABLE intake_records ADD COLUMN notes TEXT`,
    // Per-medication pill color (H6)
    `ALTER TABLE medications ADD COLUMN pill_color TEXT`,
  ],
};
