import { Injectable } from "@nestjs/common";
import { UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from "libs/common/src/request-response-type/manager/manager.model";

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

}