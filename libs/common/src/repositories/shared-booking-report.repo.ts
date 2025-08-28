import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class SharedBookingReportRepository {
    constructor(private readonly prismaService: PrismaService) { }
    async findUnique(id: number) {
        return await this.prismaService.bookingReport.findUnique({
            where: {
                id
            },
        });
    }
}