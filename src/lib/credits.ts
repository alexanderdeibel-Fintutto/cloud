// Portal Credits — thin re-export from @fintutto/shared (single source of truth)
// Consumer imports (PLANS_LIST, Plan, PLANS, etc.) are preserved unchanged.

export type {
  Plan,
  ActionType,
  UserCredits,
  UserRole,
  PortalPlanId,
} from '../../packages/shared/src/credits'

export {
  ALL_PLANS,
  PLAN_CREDIT_LIMITS,
  CREDIT_COSTS,
  TOOL_ROLE_MAP,
  TOOL_ACTION_MAP,
  canPerformAction,
  canAccessTool,
  canUseAI,
  formatCreditsDisplay,
  getPlanByPriceId,
  PORTAL_PLAN_IDS,
  getPlansSubset,
} from '../../packages/shared/src/credits'

import { getPlansList, PORTAL_PLAN_IDS, getPlansSubset, type PortalPlanId } from '../../packages/shared/src/credits'

// Preserve existing exported names
export type PlanType = PortalPlanId
export const PLANS = getPlansSubset(PORTAL_PLAN_IDS)
export const PLANS_LIST = getPlansList(PORTAL_PLAN_IDS)
