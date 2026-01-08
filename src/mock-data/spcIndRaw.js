// src/mocks/spcIndRaw.js

// ===================================================
// Fry Length (target ~80) — 100 points
// Patterns: Stable -> Upward Shift/Trend -> Stable
// ===================================================
export const fryLengthIndRaw = [
    { timestamp: '08:00:00', value: 80.02 }, { timestamp: '09:00:00', value: 79.98 },
    { timestamp: '10:00:00', value: 80.05 }, { timestamp: '11:00:00', value: 80.01 },
    { timestamp: '12:00:00', value: 79.97 }, { timestamp: '13:00:00', value: 80.06 },
    { timestamp: '14:00:00', value: 80.00 }, { timestamp: '15:00:00', value: 79.96 },
    { timestamp: '16:00:00', value: 80.03 }, { timestamp: '17:00:00', value: 80.01 },
    { timestamp: '18:00:00', value: 80.04 }, { timestamp: '19:00:00', value: 80.02 },
    { timestamp: '20:00:00', value: 79.99 }, { timestamp: '21:00:00', value: 80.06 },
    { timestamp: '22:00:00', value: 80.08 }, { timestamp: '23:00:00', value: 80.01 },
    { timestamp: '00:00:00', value: 79.95 }, { timestamp: '01:00:00', value: 80.00 },
    { timestamp: '02:00:00', value: 80.04 }, { timestamp: '03:00:00', value: 80.02 },
    // Shift Upward (OOC Trend)
    { timestamp: '04:00:00', value: 81.10 }, { timestamp: '05:00:00', value: 81.25 },
    { timestamp: '06:00:00', value: 81.30 }, { timestamp: '07:00:00', value: 81.40 },
    { timestamp: '08:00:00', value: 81.45 }, { timestamp: '09:00:00', value: 81.38 },
    { timestamp: '10:00:00', value: 81.42 }, { timestamp: '11:00:00', value: 81.50 },
    // Returning to base for rest of 100 points
    { timestamp: '12:00:00', value: 80.04 }, { timestamp: '13:00:00', value: 80.01 },
    { timestamp: '14:00:00', value: 79.98 }, { timestamp: '15:00:00', value: 80.02 },
    { timestamp: '16:00:00', value: 80.05 }, { timestamp: '17:00:00', value: 80.03 },
    { timestamp: '18:00:00', value: 80.00 }, { timestamp: '19:00:00', value: 79.97 },
    { timestamp: '20:00:00', value: 80.01 }, { timestamp: '21:00:00', value: 80.04 },
    { timestamp: '22:00:00', value: 80.02 }, { timestamp: '23:00:00', value: 80.05 },
    { timestamp: '00:00:00', value: 80.03 }, { timestamp: '01:00:00', value: 80.00 },
    { timestamp: '02:00:00', value: 79.98 }, { timestamp: '03:00:00', value: 80.01 },
    { timestamp: '04:00:00', value: 80.04 }, { timestamp: '05:00:00', value: 80.02 },
    { timestamp: '06:00:00', value: 79.99 }, { timestamp: '07:00:00', value: 80.03 },
    { timestamp: '08:00:00', value: 80.01 }, { timestamp: '09:00:00', value: 80.04 },
    { timestamp: '10:00:00', value: 80.02 }, { timestamp: '11:00:00', value: 80.05 },
    { timestamp: '12:00:00', value: 80.03 }, { timestamp: '13:00:00', value: 80.00 },
    { timestamp: '14:00:00', value: 79.98 }, { timestamp: '15:00:00', value: 80.01 },
    { timestamp: '16:00:00', value: 80.04 }, { timestamp: '17:00:00', value: 80.02 },
    { timestamp: '18:00:00', value: 80.03 }, { timestamp: '19:00:00', value: 80.01 },
    { timestamp: '20:00:00', value: 80.04 }, { timestamp: '21:00:00', value: 80.02 },
    { timestamp: '22:00:00', value: 80.05 }, { timestamp: '23:00:00', value: 80.03 },
    { timestamp: '00:00:00', value: 80.00 }, { timestamp: '01:00:00', value: 79.99 },
    { timestamp: '02:00:00', value: 80.02 }, { timestamp: '03:00:00', value: 80.04 },
    { timestamp: '04:00:00', value: 80.01 }, { timestamp: '05:00:00', value: 80.03 },
    { timestamp: '06:00:00', value: 80.05 }, { timestamp: '07:00:00', value: 79.97 },
    { timestamp: '08:00:00', value: 80.02 }, { timestamp: '09:00:00', value: 80.00 },
    { timestamp: '10:00:00', value: 80.06 }, { timestamp: '11:00:00', value: 79.99 },
    { timestamp: '12:00:00', value: 80.01 }, { timestamp: '13:00:00', value: 80.04 },
    { timestamp: '14:00:00', value: 80.02 }, { timestamp: '15:00:00', value: 79.98 },
    { timestamp: '16:00:00', value: 80.05 }, { timestamp: '17:00:00', value: 80.01 },
    { timestamp: '18:00:00', value: 79.96 }, { timestamp: '19:00:00', value: 80.03 },
    { timestamp: '20:00:00', value: 80.00 }, { timestamp: '21:00:00', value: 80.02 },
    { timestamp: '22:00:00', value: 80.04 }, { timestamp: '23:00:00', value: 80.01 },
    { timestamp: '00:00:00', value: 79.99 }, { timestamp: '01:00:00', value: 80.05 },
    { timestamp: '02:00:00', value: 80.02 }, { timestamp: '03:00:00', value: 80.00 },
    { timestamp: '04:00:00', value: 80.03 }, { timestamp: '05:00:00', value: 80.01 },
    { timestamp: '06:00:00', value: 80.04 }, { timestamp: '07:00:00', value: 80.02 }
];

// ===================================================
// Oil Temperature (target ~175) — 100 points
// Patterns: Stable -> Sharp Spikes (OOC) -> Oscillation
// ===================================================
export const oilTempIndRaw = [
    { timestamp: '08:00:00', value: 174.8 }, { timestamp: '09:00:00', value: 175.1 },
    { timestamp: '10:00:00', value: 175.0 }, { timestamp: '11:00:00', value: 175.3 },
    { timestamp: '12:00:00', value: 174.9 }, { timestamp: '13:00:00', value: 175.2 },
    { timestamp: '14:00:00', value: 175.4 }, { timestamp: '15:00:00', value: 175.1 },
    { timestamp: '16:00:00', value: 174.7 }, { timestamp: '17:00:00', value: 175.0 },
    // Spikes (Beyond 3 Sigma)
    { timestamp: '18:00:00', value: 178.6 }, { timestamp: '19:00:00', value: 179.1 },
    { timestamp: '20:00:00', value: 178.9 },
    // Normalization
    { timestamp: '21:00:00', value: 175.2 }, { timestamp: '22:00:00', value: 175.0 },
    { timestamp: '23:00:00', value: 174.8 }, { timestamp: '00:00:00', value: 175.1 },
    { timestamp: '01:00:00', value: 175.3 }, { timestamp: '02:00:00', value: 175.0 },
    { timestamp: '03:00:00', value: 174.9 }, { timestamp: '04:00:00', value: 175.2 },
    { timestamp: '05:00:00', value: 175.4 }, { timestamp: '06:00:00', value: 175.1 },
    { timestamp: '07:00:00', value: 174.8 },
    // Oscillating Sequence (Rule 14: 14 points alternating up and down)
    { timestamp: '08:00:00', value: 175.8 }, { timestamp: '09:00:00', value: 174.2 },
    { timestamp: '10:00:00', value: 175.7 }, { timestamp: '11:00:00', value: 174.3 },
    { timestamp: '12:00:00', value: 175.6 }, { timestamp: '13:00:00', value: 174.4 },
    { timestamp: '14:00:00', value: 175.8 }, { timestamp: '15:00:00', value: 174.2 },
    { timestamp: '16:00:00', value: 175.9 }, { timestamp: '17:00:00', value: 174.1 },
    { timestamp: '18:00:00', value: 175.7 }, { timestamp: '19:00:00', value: 174.3 },
    { timestamp: '20:00:00', value: 175.8 }, { timestamp: '21:00:00', value: 174.2 },
    // Continue to 100 with random noise
    { timestamp: '22:00:00', value: 175.1 }, { timestamp: '23:00:00', value: 174.9 },
    { timestamp: '00:00:00', value: 175.3 }, { timestamp: '01:00:00', value: 175.0 },
    { timestamp: '02:00:00', value: 174.8 }, { timestamp: '03:00:00', value: 175.2 },
    { timestamp: '04:00:00', value: 175.1 }, { timestamp: '05:00:00', value: 174.9 },
    { timestamp: '06:00:00', value: 175.3 }, { timestamp: '07:00:00', value: 175.0 },
    { timestamp: '08:00:00', value: 174.8 }, { timestamp: '09:00:00', value: 175.2 },
    { timestamp: '10:00:00', value: 175.1 }, { timestamp: '11:00:00', value: 174.9 },
    { timestamp: '12:00:00', value: 175.3 }, { timestamp: '13:00:00', value: 175.0 },
    { timestamp: '14:00:00', value: 174.8 }, { timestamp: '15:00:00', value: 175.2 },
    { timestamp: '16:00:00', value: 175.1 }, { timestamp: '17:00:00', value: 174.9 },
    { timestamp: '18:00:00', value: 175.3 }, { timestamp: '19:00:00', value: 175.0 },
    { timestamp: '20:00:00', value: 174.8 }, { timestamp: '21:00:00', value: 175.2 },
    { timestamp: '22:00:00', value: 175.1 }, { timestamp: '23:00:00', value: 174.9 },
    { timestamp: '00:00:00', value: 175.3 }, { timestamp: '01:00:00', value: 175.0 },
    { timestamp: '02:00:00', value: 174.8 }, { timestamp: '03:00:00', value: 175.2 },
    { timestamp: '04:00:00', value: 175.1 }, { timestamp: '05:00:00', value: 174.9 },
    { timestamp: '06:00:00', value: 175.3 }, { timestamp: '07:00:00', value: 175.0 },
    { timestamp: '08:00:00', value: 174.8 }, { timestamp: '09:00:00', value: 175.2 },
    { timestamp: '10:00:00', value: 175.1 }, { timestamp: '11:00:00', value: 174.9 },
    { timestamp: '12:00:00', value: 175.3 }, { timestamp: '13:00:00', value: 175.0 },
    { timestamp: '14:00:00', value: 174.8 }, { timestamp: '15:00:00', value: 175.2 },
    { timestamp: '16:00:00', value: 175.1 }, { timestamp: '17:00:00', value: 174.9 },
    { timestamp: '18:00:00', value: 175.3 }, { timestamp: '19:00:00', value: 175.0 },
    { timestamp: '20:00:00', value: 174.8 }, { timestamp: '21:00:00', value: 175.2 },
    { timestamp: '22:00:00', value: 175.1 }, { timestamp: '23:00:00', value: 174.9 }
];

// ===================================================
// Bag Weight (target ~500) — 100 points
// Patterns: Stable -> Significant Dip -> Sustained Shift
// ===================================================
export const bagWeightIndRaw = [
    { timestamp: '08:00:00', value: 499.2 }, { timestamp: '09:00:00', value: 500.1 },
    { timestamp: '10:00:00', value: 501.0 }, { timestamp: '11:00:00', value: 498.9 },
    { timestamp: '12:00:00', value: 500.5 }, { timestamp: '13:00:00', value: 499.7 },
    { timestamp: '14:00:00', value: 501.4 }, { timestamp: '15:00:00', value: 500.0 },
    { timestamp: '16:00:00', value: 498.8 }, { timestamp: '17:00:00', value: 500.9 },
    // Heavy Dip (Underweight OOC)
    { timestamp: '18:00:00', value: 492.5 }, { timestamp: '19:00:00', value: 491.8 },
    { timestamp: '20:00:00', value: 490.9 },
    // Partial Recovery into Shift (Rule: 8+ points below mean)
    { timestamp: '21:00:00', value: 498.5 }, { timestamp: '22:00:00', value: 497.4 },
    { timestamp: '23:00:00', value: 498.2 }, { timestamp: '00:00:00', value: 497.0 },
    { timestamp: '01:00:00', value: 497.6 }, { timestamp: '02:00:00', value: 498.1 },
    { timestamp: '03:00:00', value: 497.1 }, { timestamp: '04:00:00', value: 497.7 },
    { timestamp: '05:00:00', value: 498.2 }, { timestamp: '06:00:00', value: 497.4 },
    { timestamp: '07:00:00', value: 497.9 },
    // Return to Center Line for remainder
    { timestamp: '08:00:00', value: 500.2 }, { timestamp: '09:00:00', value: 499.8 },
    { timestamp: '10:00:00', value: 500.5 }, { timestamp: '11:00:00', value: 500.1 },
    { timestamp: '12:00:00', value: 499.6 }, { timestamp: '13:00:00', value: 500.4 },
    { timestamp: '14:00:00', value: 500.0 }, { timestamp: '15:00:00', value: 499.7 },
    { timestamp: '16:00:00', value: 500.3 }, { timestamp: '17:00:00', value: 499.9 },
    { timestamp: '18:00:00', value: 500.6 }, { timestamp: '19:00:00', value: 500.2 },
    { timestamp: '20:00:00', value: 499.8 }, { timestamp: '21:00:00', value: 500.5 },
    { timestamp: '22:00:00', value: 500.1 }, { timestamp: '23:00:00', value: 499.6 },
    { timestamp: '00:00:00', value: 500.4 }, { timestamp: '01:00:00', value: 500.0 },
    { timestamp: '02:00:00', value: 499.7 }, { timestamp: '03:00:00', value: 500.3 },
    { timestamp: '04:00:00', value: 499.9 }, { timestamp: '05:00:00', value: 500.6 },
    { timestamp: '06:00:00', value: 500.2 }, { timestamp: '07:00:00', value: 499.8 },
    { timestamp: '08:00:00', value: 500.5 }, { timestamp: '09:00:00', value: 500.1 },
    { timestamp: '10:00:00', value: 499.6 }, { timestamp: '11:00:00', value: 500.4 },
    { timestamp: '12:00:00', value: 500.0 }, { timestamp: '13:00:00', value: 499.7 },
    { timestamp: '14:00:00', value: 500.3 }, { timestamp: '15:00:00', value: 499.9 },
    { timestamp: '16:00:00', value: 500.6 }, { timestamp: '17:00:00', value: 500.2 },
    { timestamp: '18:00:00', value: 499.8 }, { timestamp: '19:00:00', value: 500.5 },
    { timestamp: '20:00:00', value: 500.1 }, { timestamp: '21:00:00', value: 499.6 },
    { timestamp: '22:00:00', value: 500.4 }, { timestamp: '23:00:00', value: 500.0 },
    { timestamp: '00:00:00', value: 499.7 }, { timestamp: '01:00:00', value: 500.3 },
    { timestamp: '02:00:00', value: 499.9 }, { timestamp: '03:00:00', value: 500.6 },
    { timestamp: '04:00:00', value: 500.2 }, { timestamp: '05:00:00', value: 499.8 },
    { timestamp: '06:00:00', value: 500.5 }, { timestamp: '07:00:00', value: 500.1 },
    { timestamp: '08:00:00', value: 499.6 }, { timestamp: '09:00:00', value: 500.4 },
    { timestamp: '10:00:00', value: 500.0 }, { timestamp: '11:00:00', value: 499.7 },
    { timestamp: '12:00:00', value: 500.3 }, { timestamp: '13:00:00', value: 499.9 },
    { timestamp: '14:00:00', value: 500.6 }, { timestamp: '15:00:00', value: 500.2 },
    { timestamp: '16:00:00', value: 499.8 }, { timestamp: '17:00:00', value: 500.5 },
    { timestamp: '18:00:00', value: 500.1 }, { timestamp: '19:00:00', value: 499.6 },
    { timestamp: '20:00:00', value: 500.4 }, { timestamp: '21:00:00', value: 500.0 },
    { timestamp: '22:00:00', value: 499.7 }, { timestamp: '23:00:00', value: 500.3 },
    { timestamp: '00:00:00', value: 499.9 }, { timestamp: '01:00:00', value: 500.6 }
];