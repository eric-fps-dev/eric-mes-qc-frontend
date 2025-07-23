import { translate } from '@/utils/i18n';

export const FLOW_STEP_MAP = {
    flow_1: () => [translate('approvalDetail.steps.submitter'), translate('approvalDetail.steps.archive')],
    flow_2: () => [translate('approvalDetail.steps.submitter'), translate('approvalDetail.steps.leaderSign'), translate('approvalDetail.steps.archive')],
    flow_3: () => [translate('approvalDetail.steps.submitter'), translate('approvalDetail.steps.supervisorSign'), translate('approvalDetail.steps.archive')],
    flow_4: () => [translate('approvalDetail.steps.submitter'), translate('approvalDetail.steps.leaderSign'), translate('approvalDetail.steps.supervisorSign'), translate('approvalDetail.steps.archive')]
};

export function getStepsFromState(flow, state) {
    const titles = FLOW_STEP_MAP[flow] ? FLOW_STEP_MAP[flow]() : [];
    let currentIndex = 0;

    // 模拟状态映射（你也可以从后端返回实际的状态）
    const stateToIndex = {
        pending: 0,
        pending_leader: 1,
        approved_leader: 2,
        pending_supervisor: flow === 'flow_3' ? 1 : 2,
        fully_approved: titles.length - 1,
        approved: titles.length - 1
    };

    if (state && stateToIndex[state] !== undefined) {
        currentIndex = stateToIndex[state];
    }

    return titles.map((title, index) => {
        const isLast = index === titles.length - 1;
        if (isLast && state === 'fully_approved') return { title, status: 'success' };
        if (index < currentIndex) return { title, status: 'success' };
        if (index === currentIndex) return { title, status: 'process' };
        return { title, status: 'wait' };
    });

}
