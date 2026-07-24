import { z } from "zod"

export class BmhpExaminationParameterMiddleware {
  // Schema for creating BMHP Examination Parameter
  readonly createBmhpExaminationParameterSchema = z.object({
    examination_id: z
      .number({
        required_error: "Examination ID is required",
        invalid_type_error: "Examination ID must be a number",
      })
      .positive("Examination ID must be a positive integer")
      .int("Examination ID must be an integer"),
    parameter_id: z
      .number({
        required_error: "Parameter ID is required",
        invalid_type_error: "Parameter ID must be a number",
      })
      .positive("Parameter ID must be a positive integer")
      .int("Parameter ID must be an integer"),
    sort_order: z
      .number({
        invalid_type_error: "Sort order must be a number",
      })
      .int("Sort order must be an integer")
      .optional()
      .default(1),
  })

  // Schema for bulk creating BMHP Examination Parameters
  readonly bulkCreateBmhpExaminationParametersSchema = z.object({
    examination_id: z
      .number({
        required_error: "Examination ID is required",
        invalid_type_error: "Examination ID must be a number",
      })
      .positive("Examination ID must be a positive integer")
      .int("Examination ID must be an integer"),
    parameters: z
      .array(
        z.object({
          parameter_id: z
            .number({
              required_error: "Parameter ID is required",
              invalid_type_error: "Parameter ID must be a number",
            })
            .positive("Parameter ID must be a positive integer")
            .int("Parameter ID must be an integer"),
          sort_order: z
            .number({
              invalid_type_error: "Sort order must be a number",
            })
            .int("Sort order must be an integer")
            .optional()
            .default(1),
        })
      )
      .min(1, "At least one parameter is required"),
  })

  // Schema for updating BMHP Examination Parameter
  readonly updateBmhpExaminationParameterSchema = z.object({
    parameter_id: z
      .number({
        invalid_type_error: "Parameter ID must be a number",
      })
      .positive("Parameter ID must be a positive integer")
      .int("Parameter ID must be an integer")
      .optional(),
    sort_order: z
      .number({
        invalid_type_error: "Sort order must be a number",
      })
      .int("Sort order must be an integer")
      .optional(),
  })
}
