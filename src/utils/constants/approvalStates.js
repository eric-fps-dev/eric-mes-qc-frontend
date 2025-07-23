// utils/constants/approvalStates.js
import { translate } from '@/utils/i18n';

export const APPROVAL_STATE_LABELS = {
    pending_leader: () => translate('approvalStates.pendingLeader'),
    pending_supervisor: () => translate('approvalStates.pendingSupervisor'),
    fully_approved: () => translate('approvalStates.fullyApproved'),
};

export const APPROVAL_STATE_TAG_TYPES = {
    pending_leader: 'warning',
    pending_supervisor: 'danger',
    fully_approved: 'success',
};

