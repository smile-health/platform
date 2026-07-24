import { z } from "zod"

export class BmhpExaminationTargetGroupMiddleware {
  // Schema for creating BMHP Examination Target Group
  readonly createBmhpExaminationTargetGroupSchema = z.object({
    examination_id: z
      .number({
        required_error: "Examination ID is required",
        invalid_type_error: "Examination ID must be a number",
      })
      .positive("Examination ID must be a positive integer")
      .int("Examination ID must be an integer"),
    target_group_id: z
      .number({
        required_error: "Target Group ID is required",
        invalid_type_error: "Target Group ID must be a number",
      })
      .positive("Target Group ID must be a positive integer")
      .int("Target Group ID must be an integer"),
  })

  // Schema for bulk creating BMHP Examination Target Groups
  readonly bulkCreateBmhpExaminationTargetGroupsSchema = z.object({
    examination_id: z
      .number({
        required_error: "Examination ID is required",
        invalid_type_error: "Examination ID must be a number",
      })
      .positive("Examination ID must be a positive integer")
      .int("Examination ID must be an integer"),
    target_groups: z
      .array(
        z.object({
          target_group_id: z
            .number({
              required_error: "Target Group ID is required",
              invalid_type_error: "Target Group ID must be a number",
            })
            .positive("Target Group ID must be a positive integer")
            .int("Target Group ID must be an integer"),
        })
      )
      .min(1, "At least one target group is required"),
  })
}
