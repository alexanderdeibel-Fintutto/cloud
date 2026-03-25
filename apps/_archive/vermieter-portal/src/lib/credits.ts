// Vermieter Portal Credits — re-export Vermieter subset from shared
export type {
  Plan,
  ActionType,
  UserCredits,
  UserRole,
} from '../../../../packages/shared/src/credits'

export {
  CREDIT_COSTS,
  TOOL_ACTION_MAP,
  canPerformAction,
  canUseAI,
  formatCreditsDisplay,
} from '../../../../packages/shared/src/credits'

import { getPlansList, VERMIETER_PLAN_IDS, getPlansSubset, type VermieterPlanId } from '../../../../packages/shared/src/credits'

export type PlanType = VermieterPlanId
export const PLANS = getPlansSubset(VERMIETER_PLAN_IDS)
export const PLANS_LIST = getPlansList(VERMIETER_PLAN_IDS)
