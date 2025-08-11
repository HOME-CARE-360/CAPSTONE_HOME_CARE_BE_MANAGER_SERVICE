import { Injectable } from "@nestjs/common";
import { Prisma, ServiceStatus, WithdrawalStatus } from "@prisma/client";
import { OrderByType, SortBy, SortByType } from "libs/common/src/constants/others.constant";
import { GetListProviderQueryType, UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from "libs/common/src/request-response-type/manager/manager.model";
import { GetListReportQueryType, UpdateProviderReportType } from "libs/common/src/request-response-type/report/report.model";
import { GetListWidthDrawQueryDTO } from "libs/common/src/request-response-type/with-draw/with-draw.dto";
import { UpdateWithDrawalBodyType } from "libs/common/src/request-response-type/with-draw/with-draw.model";

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
        if (query.status) {
            where.status = {
                in: query.status
            }
        }
        return await this.prismaService.withdrawalRequest.findMany({
            where,
            orderBy: {
                [query.sortBy]: query.orderBy
            }
            ,
            skip: (query.page - 1) * query.limit,
            take: query.limit

        })
    }
    async getWithDrawDetail(id: number) {
        const data = await this.prismaService.withdrawalRequest.findUnique({
            where: { id },
            select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
                processedAt: true,
                note: true,

                ServiceProvider: {
                    select: {
                        address: true,
                        description: true, companyType: true,
                        logo: true,
                        industry: true,
                        licenseNo: true,
                        taxId: true,

                        user: {
                            select: {
                                name: true,
                                phone: true,
                                email: true,
                                Wallet: {
                                    select: {
                                        bankAccount: true,
                                        bankName: true,
                                        accountHolder: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!data) return null;


        const { ServiceProvider, ...rest } = data;
        const { user, ...providerFields } = ServiceProvider;

        return {
            ...rest,
            ServiceProvider: {
                ...providerFields,
                ...user
            }
        };

    }
    async changeStatusWidthDraw(body: UpdateWithDrawalBodyType, userId: number) {
        const { id, ...rest } = body

        const withdrawalRequest = await this.prismaService.withdrawalRequest.update({
            where: {
                id
            }, data: {
                ...rest,
                processedAt: new Date(),
                providerId: userId
            },
        })

        if (body.status === WithdrawalStatus.COMPLETED) {
            const userId = await this.prismaService.serviceProvider.findUnique({
                where: {
                    id: withdrawalRequest.providerId
                },
                select: {
                    userId: true
                }
            })
            return await this.prismaService.wallet.update({
                where: {
                    userId: userId!.userId
                },
                data: {
                    balance: {
                        decrement: withdrawalRequest.amount
                    }
                }
            })
        }
    }

    async getListReport(query: GetListReportQueryType) {
        const { page, limit, sortBy, orderBy, status } = query;

        const where: Prisma.ProviderReportWhereInput = {};

        if (status) {
            where.status = Array.isArray(status)
                ? { in: status }
                : status;
        }

        const [total, data] = await Promise.all([
            this.prismaService.providerReport.count({ where }),
            this.prismaService.providerReport.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortBy]: orderBy,
                },
            }),
        ]);

        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateReport(body: UpdateProviderReportType, reportId: number, userId: number) {

        return await this.prismaService.providerReport.update({
            where: {
                id: reportId
            },
            data: {
                ...body,
                reviewedAt: new Date(),
                reviewedById: userId
            }
        }
        )
    }
    async getListProvider(query: GetListProviderQueryType) {
        const where: Prisma.ServiceProviderWhereInput = {};

        if (query.licenseNo) {
            where.licenseNo = query.licenseNo;
        }

        if (query.companyType) {
            where.companyType = query.companyType;
        }

        if (query.verificationStatus) {
            where.verificationStatus = query.verificationStatus;
        }

        if (query.taxId) {
            where.taxId = {
                contains: query.taxId,
                mode: 'insensitive',
            };
        }

        const page = query.page || 1;
        const limit = query.limit || 10;

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.serviceProvider.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prismaService.serviceProvider.count({
                where,
            }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async list({
        limit,
        page,
        name,
        providerIds,
        categories,
        minPrice,
        maxPrice,
        orderBy,
        sortBy,
        status
    }: {
        limit: number
        page: number
        name?: string
        providerIds?: number[]
        categories?: number[]
        minPrice?: number
        maxPrice?: number
        orderBy: OrderByType
        sortBy: SortByType
        status: ServiceStatus[]
    }) {


        const skip = (page - 1) * limit
        const take = limit
        const where: Prisma.ServiceWhereInput = {
            publishedAt: {
                lte: new Date(),
                not: null,
            },
            deletedAt: null,
        }

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive',
            }
        }
        if (status) {
            where.status = {
                in: status
            }
        }
        if (providerIds && providerIds.length > 0) {
            where.providerId = {
                in: providerIds,
            }
        }
        if (categories && categories.length > 0) {
            where.categoryId = {
                in: categories,


            }
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.virtualPrice = {
                gte: minPrice,
                lte: maxPrice,
            }
        }

        let caculatedOrderBy: Prisma.ServiceOrderByWithRelationInput | Prisma.ServiceOrderByWithRelationInput[] = {
            createdAt: orderBy,

        }
        if (sortBy === SortBy.Price) {
            caculatedOrderBy = {
                basePrice: orderBy,
            }
        } else if (sortBy === SortBy.Discount) {
            caculatedOrderBy = {
                basePrice: orderBy
            }
        }
        const [totalItems, data] = await Promise.all([
            this.prismaService.service.count({
                where,
            }),
            this.prismaService.service.findMany({
                where,

                include: {
                    // translations: {
                    //     where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                    // },
                    provider: {
                        select: {
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    Category: {

                        select: {
                            logo: true,
                            name: true
                        }
                    }
                },
                omit: {
                    deletedAt: true,
                    deletedById: true,
                    updatedAt: true,
                    updatedById: true,
                    createdAt: true,
                    createdById: true,
                    publishedAt: true
                },

                orderBy: caculatedOrderBy,
                skip,
                take,
            }),
        ])
        const services = data.map(({ provider, ...rest }) => ({ ...rest, provider: provider.user.name }))
        return {
            data: services,
            totalItems,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalItems / limit),
        }
    }
}