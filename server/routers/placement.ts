/**
 * MODULE 9: STAFF PLACEMENT & MOBILITY ROUTER
 * 
 * Manages staff placements, transfer requests, and mobility tracking.
 */

import { z } from "zod";
import { eq, desc, and, or } from "drizzle-orm";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  staffPlacements,
  placementRequests,
  placementApprovals,
} from "../../drizzle/schema-pg";

export const placementRouter = router({
  // ============================================================================
  // STAFF PLACEMENTS
  // ============================================================================

  getAllPlacements: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
      placementType: z.enum(["new_hire", "transfer", "promotion", "lateral_move", "temporary", "redeployment"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      let query = database.select().from(staffPlacements);
      // Note: Filtering would be added here based on input
      return await query.orderBy(desc(staffPlacements.createdAt));
    }),

  getPlacementById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [placement] = await database
        .select()
        .from(staffPlacements)
        .where(eq(staffPlacements.id, input.id));
      return placement || null;
    }),

  getEmployeePlacements: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(staffPlacements)
        .where(eq(staffPlacements.employeeId, input.employeeId))
        .orderBy(desc(staffPlacements.effectiveDate));
    }),

  getMyPlacementHistory: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    return await database
      .select()
      .from(staffPlacements)
      .where(eq(staffPlacements.employeeId, ctx.user.id))
      .orderBy(desc(staffPlacements.effectiveDate));
  }),

  createPlacement: adminProcedure
    .input(z.object({
      employeeId: z.number(),
      schoolId: z.number(),
      positionId: z.number(),
      placementType: z.enum(["new_hire", "transfer", "promotion", "lateral_move", "temporary", "redeployment"]),
      startDate: z.date(),
      endDate: z.date().optional(),
      isTemporary: z.boolean().optional(),
      isPrimary: z.boolean().optional(),
      workloadPercentage: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(staffPlacements).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  updatePlacement: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "completed", "cancelled"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(staffPlacements).set(data).where(eq(staffPlacements.id, id));
      return { success: true };
    }),

  // ============================================================================
  // PLACEMENT REQUESTS
  // ============================================================================

  getAllRequests: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "submitted", "under_review", "approved", "rejected", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database.select().from(placementRequests).orderBy(desc(placementRequests.createdAt));
    }),

  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    return await database
      .select()
      .from(placementRequests)
      .where(eq(placementRequests.requestedBy, ctx.user.id))
      .orderBy(desc(placementRequests.createdAt));
  }),

  getRequestById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const [request] = await database
        .select()
        .from(placementRequests)
        .where(eq(placementRequests.id, input.id));
      return request || null;
    }),

  createRequest: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      requestType: z.enum(["transfer", "promotion", "position_change", "school_change"]),
      currentSchoolId: z.number().optional(),
      currentPositionId: z.number().optional(),
      requestedSchoolId: z.number().optional(),
      requestedPositionId: z.number().optional(),
      reason: z.string().min(1),
      preferredStartDate: z.date().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const [result] = await database.insert(placementRequests).values({
        ...input,
        status: "submitted",
        submittedAt: new Date(),
      });
      return { id: result.insertId };
    }),

  updateRequest: protectedProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
      preferredStartDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(placementRequests).set(data).where(eq(placementRequests.id, id));
      return { success: true };
    }),

  submitRequest: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(placementRequests).set({
        status: "submitted",
        submittedAt: new Date(),
      }).where(eq(placementRequests.id, input.id));
      return { success: true };
    }),

  cancelRequest: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(placementRequests).set({
        status: "cancelled",
      }).where(eq(placementRequests.id, input.id));
      return { success: true };
    }),

  // ============================================================================
  // PLACEMENT APPROVALS
  // ============================================================================

  getApprovals: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return await database
        .select()
        .from(placementApprovals)
        .where(eq(placementApprovals.placementRequestId, input.requestId))
        .orderBy(placementApprovals.approvalOrder);
    }),

  getPendingApprovals: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    return await database
      .select()
      .from(placementApprovals)
      .where(
        and(
          eq(placementApprovals.approverId, ctx.user.id),
          eq(placementApprovals.status, "pending")
        )
      );
  }),

  approveRequest: protectedProcedure
    .input(z.object({
      approvalId: z.number(),
      decision: z.enum(["approved", "rejected"]),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(placementApprovals).set({
        status: input.decision,
        comments: input.comments,
        decidedAt: new Date(),
      }).where(eq(placementApprovals.id, input.approvalId));

      // Get the approval to find the request
      const [approval] = await database
        .select()
        .from(placementApprovals)
        .where(eq(placementApprovals.id, input.approvalId));

      if (approval) {
        // Check if all approvals are done
        const allApprovals = await database
          .select()
          .from(placementApprovals)
          .where(eq(placementApprovals.placementRequestId, approval.placementRequestId));

        const allApproved = allApprovals.every(a => a.status === "approved");
        const anyRejected = allApprovals.some(a => a.status === "rejected");

        if (anyRejected) {
          await database.update(placementRequests).set({
            status: "rejected",
          }).where(eq(placementRequests.id, approval.placementRequestId));
        } else if (allApproved) {
          await database.update(placementRequests).set({
            status: "approved",
          }).where(eq(placementRequests.id, approval.placementRequestId));
        }
      }

      return { success: true };
    }),

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  getPlacementStats: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return null;

    const placements = await database.select().from(staffPlacements);
    const requests = await database.select().from(placementRequests);

    const stats = {
      totalPlacements: placements.length,
      activePlacements: placements.filter(p => p.status === "active").length,
      pendingRequests: requests.filter(r => r.status === "submitted" || r.status === "under_review").length,
      approvedRequests: requests.filter(r => r.status === "approved").length,
      rejectedRequests: requests.filter(r => r.status === "rejected").length,
      byType: {
        transfers: placements.filter(p => p.placementType === "transfer").length,
        promotions: placements.filter(p => p.placementType === "promotion").length,
        lateralMoves: placements.filter(p => p.placementType === "lateral_move").length,
        newHires: placements.filter(p => p.placementType === "new_hire").length,
      },
    };

    return stats;
  }),

  // ============================================================================
  // STAFF DIRECTORY
  // ============================================================================

  getStaffDirectory: protectedProcedure
    .input(z.object({
      departmentId: z.number().optional(),
      positionId: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      
      // Get current active placements to build directory
      const activePlacements = await database
        .select()
        .from(staffPlacements)
        .where(eq(staffPlacements.status, "active"));

      return activePlacements;
    }),
});
