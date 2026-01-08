// src/mocks/spcIndRaw.js

// ===================================================
// Fry Length (target ~80) — 100 points
// ===================================================
export const fryLengthIndRaw = [
    { timestamp: '08:00:00', value: 80.02 },
    { timestamp: '09:00:00', value: 79.98 },
    { timestamp: '10:00:00', value: 80.05 },
    { timestamp: '11:00:00', value: 80.01 },
    { timestamp: '12:00:00', value: 79.97 },
    { timestamp: '13:00:00', value: 80.06 },
    { timestamp: '14:00:00', value: 80.00 },
    { timestamp: '15:00:00', value: 79.96 },
    { timestamp: '16:00:00', value: 80.03 },
    { timestamp: '17:00:00', value: 80.01 },

    { timestamp: '18:00:00', value: 80.04 },
    { timestamp: '19:00:00', value: 80.02 },
    { timestamp: '20:00:00', value: 79.99 },
    { timestamp: '21:00:00', value: 80.06 },
    { timestamp: '22:00:00', value: 80.08 },
    { timestamp: '23:00:00', value: 80.01 },
    { timestamp: '00:00:00', value: 79.95 },
    { timestamp: '01:00:00', value: 80.00 },
    { timestamp: '02:00:00', value: 80.04 },
    { timestamp: '03:00:00', value: 80.02 },

    { timestamp: '04:00:00', value: 81.10 },
    { timestamp: '05:00:00', value: 81.25 },
    { timestamp: '06:00:00', value: 81.30 },
    { timestamp: '07:00:00', value: 81.40 },

    { timestamp: '08:00:00', value: 80.04 },
    { timestamp: '09:00:00', value: 80.01 },
    { timestamp: '10:00:00', value: 79.98 },
    { timestamp: '11:00:00', value: 80.02 },
    { timestamp: '12:00:00', value: 80.05 },
    { timestamp: '13:00:00', value: 80.03 },
    { timestamp: '14:00:00', value: 80.00 },
    { timestamp: '15:00:00', value: 79.97 },
    { timestamp: '16:00:00', value: 80.01 },
    { timestamp: '17:00:00', value: 80.04 },

    { timestamp: '18:00:00', value: 80.02 },
    { timestamp: '19:00:00', value: 80.05 },
    { timestamp: '20:00:00', value: 80.03 },
    { timestamp: '21:00:00', value: 80.00 },
    { timestamp: '22:00:00', value: 79.98 },
    { timestamp: '23:00:00', value: 80.01 },
    { timestamp: '00:00:00', value: 80.04 },
    { timestamp: '01:00:00', value: 80.02 },
    { timestamp: '02:00:00', value: 79.99 },
    { timestamp: '03:00:00', value: 80.03 },

    { timestamp: '04:00:00', value: 80.01 },
    { timestamp: '05:00:00', value: 80.04 },
    { timestamp: '06:00:00', value: 80.02 },
    { timestamp: '07:00:00', value: 80.05 },
    { timestamp: '08:00:00', value: 80.03 },
    { timestamp: '09:00:00', value: 80.00 },
    { timestamp: '10:00:00', value: 79.98 },
    { timestamp: '11:00:00', value: 80.01 },
    { timestamp: '12:00:00', value: 80.04 },
    { timestamp: '13:00:00', value: 80.02 },

    { timestamp: '14:00:00', value: 80.03 },
    { timestamp: '15:00:00', value: 80.01 },
    { timestamp: '16:00:00', value: 80.04 },
    { timestamp: '17:00:00', value: 80.02 },
    { timestamp: '18:00:00', value: 80.05 },
    { timestamp: '19:00:00', value: 80.03 },
    { timestamp: '20:00:00', value: 80.00 },
    { timestamp: '21:00:00', value: 79.99 },
    { timestamp: '22:00:00', value: 80.02 },
    { timestamp: '23:00:00', value: 80.04 }
];

// ===================================================
// Oil Temperature (target ~175) — 100 points
// ===================================================
export const oilTempIndRaw = [
    { timestamp: '08:00:00', value: 174.8 },
    { timestamp: '09:00:00', value: 175.1 },
    { timestamp: '10:00:00', value: 175.0 },
    { timestamp: '11:00:00', value: 175.3 },
    { timestamp: '12:00:00', value: 174.9 },
    { timestamp: '13:00:00', value: 175.2 },
    { timestamp: '14:00:00', value: 175.4 },
    { timestamp: '15:00:00', value: 175.1 },
    { timestamp: '16:00:00', value: 174.7 },
    { timestamp: '17:00:00', value: 175.0 },

    { timestamp: '18:00:00', value: 178.6 },
    { timestamp: '19:00:00', value: 179.1 },
    { timestamp: '20:00:00', value: 178.9 },

    { timestamp: '21:00:00', value: 175.2 },
    { timestamp: '22:00:00', value: 175.0 },
    { timestamp: '23:00:00', value: 174.8 },
    { timestamp: '00:00:00', value: 175.1 },
    { timestamp: '01:00:00', value: 175.3 },
    { timestamp: '02:00:00', value: 175.0 },
    { timestamp: '03:00:00', value: 174.9 },
    { timestamp: '04:00:00', value: 175.2 },
    { timestamp: '05:00:00', value: 175.4 },
    { timestamp: '06:00:00', value: 175.1 },
    { timestamp: '07:00:00', value: 174.8 },

    // steady oscillation
    ...[
        175.0,175.2,175.1,174.9,175.3,175.0,174.8,175.2,175.1,174.9,
        175.3,175.0,174.8,175.2,175.1,174.9,175.3,175.0,174.8,175.2,
        175.1,174.9,175.3,175.0,174.8,175.2,175.1,174.9,175.3,175.0,
        174.8,175.2,175.1,174.9,175.3,175.0,174.8,175.2,175.1,174.9,
        175.3,175.0,174.8,175.2,175.1,174.9,175.3,175.0,174.8,175.2,
        175.1,174.9,175.3,175.0,174.8,175.2,175.1,174.9,175.3,175.0,
        174.8,175.2,175.1,174.9,175.3,175.0,174.8
    ].map((v, i) => ({
        timestamp: `${String((i + 8) % 24).padStart(2, '0')}:00:00`,
        value: v
    }))
];

// ===================================================
// Bag Weight (target ~500) — 100 points
// ===================================================
export const bagWeightIndRaw = [
    { timestamp: '08:00:00', value: 499.2 },
    { timestamp: '09:00:00', value: 500.1 },
    { timestamp: '10:00:00', value: 501.0 },
    { timestamp: '11:00:00', value: 498.9 },
    { timestamp: '12:00:00', value: 500.5 },
    { timestamp: '13:00:00', value: 499.7 },
    { timestamp: '14:00:00', value: 501.4 },
    { timestamp: '15:00:00', value: 500.0 },
    { timestamp: '16:00:00', value: 498.8 },
    { timestamp: '17:00:00', value: 500.9 },

    { timestamp: '18:00:00', value: 492.5 },
    { timestamp: '19:00:00', value: 491.8 },
    { timestamp: '20:00:00', value: 490.9 },

    { timestamp: '21:00:00', value: 498.5 },
    { timestamp: '22:00:00', value: 499.4 },
    { timestamp: '23:00:00', value: 500.2 },
    { timestamp: '00:00:00', value: 501.0 },
    { timestamp: '01:00:00', value: 500.6 },
    { timestamp: '02:00:00', value: 499.8 },
    { timestamp: '03:00:00', value: 500.1 },
    { timestamp: '04:00:00', value: 500.7 },
    { timestamp: '05:00:00', value: 501.2 },
    { timestamp: '06:00:00', value: 500.4 },
    { timestamp: '07:00:00', value: 499.9 },

    // stable pattern
    ...[
        500.2,499.8,500.5,500.1,499.6,500.4,500.0,499.7,500.3,499.9,
        500.6,500.2,499.8,500.5,500.1,499.6,500.4,500.0,499.7,500.3,
        499.9,500.6,500.2,499.8,500.5,500.1,499.6,500.4,500.0,499.7,
        500.3,499.9,500.6,500.2,499.8,500.5,500.1,499.6,500.4,500.0,
        499.7,500.3,499.9,500.6,500.2,499.8,500.5,500.1,499.6,500.4,
        500.0,499.7,500.3,499.9,500.6,500.2,499.8,500.5,500.1,499.6,
        500.4,500.0,499.7,500.3,499.9,500.6,500.2,499.8
    ].map((v, i) => ({
        timestamp: `${String((i + 8) % 24).padStart(2, '0')}:00:00`,
        value: v
    }))
];
