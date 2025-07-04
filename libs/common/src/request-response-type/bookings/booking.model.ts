import { z } from "zod"
import { OrderBy, SortByServiceRequest } from "../../constants/others.constant"
import { PaymentMethod, RequestStatus } from "@prisma/client"
import { BookingSchema } from "../../models/shared-booking.model"
import { ServiceRequestSchema } from "../../models/shared-service-request.model"

export const GetServicesRequestQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    location: z.string().optional(),
    status: z.enum([RequestStatus.BOOKED, RequestStatus.ESTIMATED, RequestStatus.IN_PROGRESS, RequestStatus.PENDING, RequestStatus.REJECTED]).optional(),
    categories: z
        .preprocess((value) => {
            if (typeof value === 'string') {
                return [Number(value)]
            }
            return value
        }, z.array(z.coerce.number().int().positive()))
        .optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortByServiceRequest.CreatedAt, SortByServiceRequest.PreferredDate]).default(SortByServiceRequest.CreatedAt),
})
export const AssignStaffToBookingBodySchema = BookingSchema.pick({
    staffId: true,
    customerId: true,
    serviceRequestId: true,
})
export const CreateServiceRequestBodySchema = ServiceRequestSchema.omit({
    updatedAt: true,
    createdAt: true,
    status: true,
    id: true, customerId: true
}).extend({
    paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.CREDIT_CARD])
}).strict()
export const CreateBookingBodySchema = BookingSchema.omit({
    updatedAt: true,
    createdAt: true,
    id: true
}).strict()
export type GetServicesRequestQueryType = z.infer<typeof GetServicesRequestQuerySchema>
export type AssignStaffToBookingBodySchemaType = z.infer<typeof AssignStaffToBookingBodySchema>



export type CreateServiceRequestBodyType = z.infer<typeof CreateServiceRequestBodySchema>
export type CreateBookingBodyType = z.infer<typeof CreateBookingBodySchema>