// src/mocks/spcIndRaw.js

// ===================================================
// Fry Length (target ~80) — 100 points
// Patterns: Stable -> Upward Shift/Trend -> Stable
// ===================================================
// src/mocks/spcIndRaw.js

export const fryLengthIndRaw = [
    // 0-99: Stable
    { timestamp: '08:00', value: 80.02 }, { timestamp: '08:01', value: 79.98 }, { timestamp: '08:02', value: 80.05 }, { timestamp: '08:03', value: 80.01 }, { timestamp: '08:04', value: 79.97 }, { timestamp: '08:05', value: 80.06 }, { timestamp: '08:06', value: 80.00 }, { timestamp: '08:07', value: 79.96 }, { timestamp: '08:08', value: 80.03 }, { timestamp: '08:09', value: 80.01 },
    { timestamp: '08:10', value: 80.04 }, { timestamp: '08:11', value: 80.02 }, { timestamp: '08:12', value: 79.99 }, { timestamp: '08:13', value: 80.06 }, { timestamp: '08:14', value: 80.08 }, { timestamp: '08:15', value: 80.01 }, { timestamp: '08:16', value: 79.95 }, { timestamp: '08:17', value: 80.00 }, { timestamp: '08:18', value: 80.04 }, { timestamp: '08:19', value: 80.02 },
    { timestamp: '08:20', value: 80.01 }, { timestamp: '08:21', value: 79.99 }, { timestamp: '08:22', value: 80.03 }, { timestamp: '08:23', value: 80.00 }, { timestamp: '08:24', value: 80.05 }, { timestamp: '08:25', value: 80.02 }, { timestamp: '08:26', value: 79.97 }, { timestamp: '08:27', value: 80.04 }, { timestamp: '08:28', value: 80.01 }, { timestamp: '08:29', value: 80.06 },
    { timestamp: '08:30', value: 80.00 }, { timestamp: '08:31', value: 79.98 }, { timestamp: '08:32', value: 80.03 }, { timestamp: '08:33', value: 80.01 }, { timestamp: '08:34', value: 80.04 }, { timestamp: '08:35', value: 80.02 }, { timestamp: '08:36', value: 79.96 }, { timestamp: '08:37', value: 80.05 }, { timestamp: '08:38', value: 80.00 }, { timestamp: '08:39', value: 80.03 },
    { timestamp: '08:40', value: 80.01 }, { timestamp: '08:41', value: 79.99 }, { timestamp: '08:42', value: 80.04 }, { timestamp: '08:43', value: 80.02 }, { timestamp: '08:44', value: 80.06 }, { timestamp: '08:45', value: 80.00 }, { timestamp: '08:46', value: 79.98 }, { timestamp: '08:47', value: 80.05 }, { timestamp: '08:48', value: 80.01 }, { timestamp: '08:49', value: 80.03 },
    { timestamp: '08:50', value: 80.00 }, { timestamp: '08:51', value: 79.97 }, { timestamp: '08:52', value: 80.04 }, { timestamp: '08:53', value: 80.02 }, { timestamp: '08:54', value: 80.01 }, { timestamp: '08:55', value: 79.99 }, { timestamp: '08:56', value: 80.05 }, { timestamp: '08:57', value: 80.00 }, { timestamp: '08:58', value: 80.03 }, { timestamp: '08:59', value: 80.02 },
    { timestamp: '09:00', value: 80.06 }, { timestamp: '09:01', value: 80.01 }, { timestamp: '09:02', value: 79.98 }, { timestamp: '09:03', value: 80.04 }, { timestamp: '09:04', value: 80.00 }, { timestamp: '09:05', value: 80.03 }, { timestamp: '09:06', value: 80.01 }, { timestamp: '09:07', value: 80.05 }, { timestamp: '09:08', value: 79.99 }, { timestamp: '09:09', value: 80.02 },
    { timestamp: '09:10', value: 80.00 }, { timestamp: '09:11', value: 79.97 }, { timestamp: '09:12', value: 80.04 }, { timestamp: '09:13', value: 80.02 }, { timestamp: '09:14', value: 80.01 }, { timestamp: '09:15', value: 79.98 }, { timestamp: '09:16', value: 80.06 }, { timestamp: '09:17', value: 80.03 }, { timestamp: '09:18', value: 80.00 }, { timestamp: '09:19', value: 80.05 },
    { timestamp: '09:20', value: 80.01 }, { timestamp: '09:21', value: 79.99 }, { timestamp: '09:22', value: 80.04 }, { timestamp: '09:23', value: 80.02 }, { timestamp: '09:24', value: 80.00 }, { timestamp: '09:25', value: 80.03 }, { timestamp: '09:26', value: 80.01 }, { timestamp: '09:27', value: 80.04 }, { timestamp: '09:28', value: 80.02 }, { timestamp: '09:29', value: 80.06 },
    { timestamp: '09:30', value: 80.00 }, { timestamp: '09:31', value: 79.98 }, { timestamp: '09:32', value: 80.03 }, { timestamp: '09:33', value: 80.01 }, { timestamp: '09:34', value: 80.05 }, { timestamp: '09:35', value: 80.02 }, { timestamp: '09:36', value: 79.99 }, { timestamp: '09:37', value: 80.04 }, { timestamp: '09:38', value: 80.01 }, { timestamp: '09:39', value: 80.00 },
    // 100-115: Trend Up (OOC Trend Rule)
    { timestamp: '09:40', value: 81.10 }, { timestamp: '09:41', value: 81.25 }, { timestamp: '09:42', value: 81.30 }, { timestamp: '09:43', value: 81.40 }, { timestamp: '09:44', value: 81.45 }, { timestamp: '09:45', value: 81.55 }, { timestamp: '09:46', value: 81.60 }, { timestamp: '09:47', value: 81.70 }, { timestamp: '09:48', value: 81.80 }, { timestamp: '09:49', value: 81.90 },
    { timestamp: '09:50', value: 82.05 }, { timestamp: '09:51', value: 82.15 }, { timestamp: '09:52', value: 82.25 }, { timestamp: '09:53', value: 82.40 }, { timestamp: '09:54', value: 82.55 }, { timestamp: '09:55', value: 82.65 },
    // 116-449: Back to Stable
    ...Array(334).fill(0).map((_, i) => ({ timestamp: '10:00', value: parseFloat((80 + (Math.random() * 0.1 - 0.05)).toFixed(2)) })),
    // 450-460: Shift Down
    { timestamp: '15:30', value: 79.10 }, { timestamp: '15:31', value: 79.12 }, { timestamp: '15:32', value: 79.08 }, { timestamp: '15:33', value: 79.05 }, { timestamp: '15:34', value: 79.11 }, { timestamp: '15:35', value: 79.07 }, { timestamp: '15:36', value: 79.09 }, { timestamp: '15:37', value: 79.04 }, { timestamp: '15:38', value: 79.06 }, { timestamp: '15:39', value: 79.02 },
    // 461-500: Stable
    ...Array(39).fill(0).map((_, i) => ({ timestamp: '16:00', value: parseFloat((80 + (Math.random() * 0.1 - 0.05)).toFixed(2)) }))
];

// ===================================================
// Oil Temperature (target ~175) — 100 points
// Patterns: Stable -> Sharp Spikes (OOC) -> Oscillation
// ===================================================
export const oilTempIndRaw = [
    // 0-199: Stable
    ...Array(200).fill(0).map((_, i) => ({ timestamp: '08:00', value: parseFloat((175 + (Math.random() * 0.6 - 0.3)).toFixed(2)) })),
    // 200-205: Large Spikes (Rule 1: Beyond 3 Sigma)
    { timestamp: '11:20', value: 178.6 }, { timestamp: '11:21', value: 179.2 }, { timestamp: '11:22', value: 174.1 }, { timestamp: '11:23', value: 180.5 }, { timestamp: '11:24', value: 173.8 }, { timestamp: '11:25', value: 179.9 },
    // 206-299: Stable
    ...Array(94).fill(0).map((_, i) => ({ timestamp: '12:00', value: parseFloat((175 + (Math.random() * 0.4 - 0.2)).toFixed(2)) })),
    // 300-314: Oscillation (Rule: 14 points alternating up and down)
    { timestamp: '14:30', value: 176.5 }, { timestamp: '14:31', value: 173.5 }, { timestamp: '14:32', value: 176.4 }, { timestamp: '14:33', value: 173.6 }, { timestamp: '14:34', value: 176.3 }, { timestamp: '14:35', value: 173.7 }, { timestamp: '14:36', value: 176.2 }, { timestamp: '14:37', value: 173.8 }, { timestamp: '14:38', value: 176.1 }, { timestamp: '14:39', value: 173.9 },
    { timestamp: '14:40', value: 176.0 }, { timestamp: '14:41', value: 174.0 }, { timestamp: '14:42', value: 175.9 }, { timestamp: '14:43', value: 174.1 }, { timestamp: '14:44', value: 175.8 },
    // 315-500: Stable
    ...Array(185).fill(0).map((_, i) => ({ timestamp: '15:00', value: parseFloat((175 + (Math.random() * 0.4 - 0.2)).toFixed(2)) }))
];

// ===================================================
// Bag Weight (target ~500) — 100 points
// Patterns: Stable -> Significant Dip -> Sustained Shift
// ===================================================
export const bagWeightIndRaw = [
    // 0-149: Stable
    ...Array(150).fill(0).map((_, i) => ({ timestamp: '08:00', value: parseFloat((500 + (Math.random() * 1.2 - 0.6)).toFixed(2)) })),
    // 150-155: Heavy Dip (OOC)
    { timestamp: '10:30', value: 492.1 }, { timestamp: '10:31', value: 491.5 }, { timestamp: '10:32', value: 490.8 }, { timestamp: '10:33', value: 493.2 }, { timestamp: '10:34', value: 491.9 }, { timestamp: '10:35', value: 492.5 },
    // 156-399: Stable
    ...Array(244).fill(0).map((_, i) => ({ timestamp: '11:00', value: parseFloat((500 + (Math.random() - 0.5)).toFixed(2)) })),
    // 400-420: Sustained Shift (8+ points below mean)
    { timestamp: '14:00', value: 498.1 }, { timestamp: '14:01', value: 497.8 }, { timestamp: '14:02', value: 498.2 }, { timestamp: '14:03', value: 497.9 }, { timestamp: '14:04', value: 498.0 }, { timestamp: '14:05', value: 497.7 }, { timestamp: '14:06', value: 498.3 }, { timestamp: '14:07', value: 497.6 }, { timestamp: '14:08', value: 498.1 }, { timestamp: '14:09', value: 497.5 },
    { timestamp: '14:10', value: 498.2 }, { timestamp: '14:11', value: 497.8 }, { timestamp: '14:12', value: 498.0 }, { timestamp: '14:13', value: 497.9 }, { timestamp: '14:14', value: 498.4 }, { timestamp: '14:15', value: 497.7 }, { timestamp: '14:16', value: 498.1 }, { timestamp: '14:17', value: 497.6 }, { timestamp: '14:18', value: 498.2 }, { timestamp: '14:19', value: 497.5 },
    // 421-500: Stable
    ...Array(79).fill(0).map((_, i) => ({ timestamp: '15:00', value: parseFloat((500 + (Math.random() - 0.5)).toFixed(2)) }))
];