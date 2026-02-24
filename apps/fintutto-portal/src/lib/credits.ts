// Fintutto Portal Credits — re-export Portal subset from shared
export type {
  Plan,
  ActionType,
  UserCredits,
  UserRole,
} from '../../../../packages/shared/src/credits'

export {
  CREDIT_COSTS,
  TOOL_ROLE_MAP,
  TOOL_ACTION_MAP,
  canPerformAction,
  canAccessTool,
  canUseAI,
  formatCreditsDisplay,
  getPlanByPriceId,
} from '../../../../packages/shared/src/credits'

import { getPlansList, PORTAL_PLAN_IDS, getPlansSubset, type PortalPlanId } from '../../../../packages/shared/src/credits'

export type PlanType = PortalPlanId
export const PLANS = getPlansSubset(PORTAL_PLAN_IDS)
export const PLANS_LIST = getPlansList(PORTAL_PLAN_IDS)
