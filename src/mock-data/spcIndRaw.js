// src/mocks/spcIndRaw.js

// ========== Fry Length (target ~80) ==========
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

    // ---- small shift + out-of-limit region ----
    { timestamp: '04:00:00', value: 81.10 },
    { timestamp: '05:00:00', value: 81.25 },
    { timestamp: '06:00:00', value: 81.30 },
    { timestamp: '07:00:00', value: 81.40 },

    // ---- stabilize again ----
    ...Array.from({ length: 76 }, (_, i) => ({
        timestamp: `${String((8 + i) % 24).padStart(2, '0')}:00:00`,
        value: Number((80 + ((i % 5) - 2) * 0.03).toFixed(2))
    }))
].slice(0, 100);


// ========== Oil Temperature (target ~175) ==========
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

    // ---- brief overheating ----
    { timestamp: '18:00:00', value: 178.6 },
    { timestamp: '19:00:00', value: 179.1 },
    { timestamp: '20:00:00', value: 178.9 },

    // ---- normal operation ----
    ...Array.from({ length: 87 }, (_, i) => ({
        timestamp: `${String((21 + i) % 24).padStart(2, '0')}:00:00`,
        value: Number((175 + ((i % 7) - 3) * 0.15).toFixed(2))
    }))
].slice(0, 100);


// ========== Bag Weight (target ~500) ==========
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

    // ---- underweight drift ----
    { timestamp: '18:00:00', value: 492.5 },
    { timestamp: '19:00:00', value: 491.8 },
    { timestamp: '20:00:00', value: 490.9 },

    // ---- recovery ----
    ...Array.from({ length: 87 }, (_, i) => ({
        timestamp: `${String((21 + i) % 24).padStart(2, '0')}:00:00`,
        value: Number((500 + ((i % 9) - 4) * 0.6).toFixed(1))
    }))
].slice(0, 100);
