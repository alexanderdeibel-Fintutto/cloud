// Mieterportal Credits — re-export Mieter-Checker subset from shared
export type {
  Plan,
  MieterCheckerPlanId,
} from '../../../../packages/shared/src/credits'

export {
  formatCreditsDisplay,
  getPlanByPriceId,
} from '../../../../packages/shared/src/credits'

import { getPlansList, MIETER_CHECKER_PLAN_IDS, getPlansSubset, type MieterCheckerPlanId } from '../../../../packages/shared/src/credits'

export type MieterCheckerPlan = MieterCheckerPlanId
export const PLANS = getPlansSubset(MIETER_CHECKER_PLAN_IDS)
export const PLANS_LIST = getPlansList(MIETER_CHECKER_PLAN_IDS)
export const PLAN_CREDIT_LIMITS = Object.fromEntries(
  MIETER_CHECKER_PLAN_IDS.map(id => [id, PLANS[id].monthlyCredits])
) as Record<MieterCheckerPlan, number>
