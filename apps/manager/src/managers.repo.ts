import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from "libs/common/src/request-response-type/manager/manager.model";
import { GetListWidthDrawQueryDTO } from "libs/common/src/request-response-type/with-draw/with-draw.dto";

import { PrismaService } from "libs/common/src/services/prisma.service";



@Injectable()
export class ManagerRepository {
    constructor(private readonly prismaService: PrismaService) { }
    async acceptProvider(body: UpdateStatusProviderBodyType, userId: number) {
        return await this.prismaService.serviceProvider.update({
            where: { id: body.id },
            data: {
                verificationStatus: body.verificationStatus,
                verifiedById: body.verificationStatus === "VERIFIED" ? userId : null,
                verifiedAt: body.verificationStatus === "VERIFIED" ? new Date() : null,

            }
        })

    }
    async updateStatusService(body: UpdateStatusServiceBodyType) {
        return await this.prismaService.service.update({
            where: { id: body.id },
            data: {
                status: body.status

            }
        })
    }
    async getListWithDraw(query: GetListWidthDrawQueryDTO) {
        const where: Prisma.WithdrawalRequestWhereInput = {}

        if (query.providerName) {
            where.ServiceProvider!.user = {
                name: query.providerName
            }
        }
        return await this.prismaService.withdrawalRequest.findMany({
            where,
            orderBy: {
                [query.sortBy]: query.sortBy
            }
            ,
            skip: (query.page - 1) * query.limit,
            take: query.limit

        })
    }

}