import { Injectable } from "@nestjs/common";
import { BookingStatus, PaymentStatus, PaymentTransactionStatus, Prisma, ReportStatus, ServiceStatus, WithdrawalStatus } from "@prisma/client";
import { OrderByType, SortBy, SortByType } from "libs/common/src/constants/others.constant";
import { RoleName } from "libs/common/src/constants/role.constant";
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
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const keyword = (query.username || "").trim();
        const statuses = Array.isArray(query.status)
            ? query.status
            : query.status
                ? [query.status]
                : [];

        const where: Prisma.WithdrawalRequestWhereInput = {
            ...(keyword && {
                OR: [
                    { User: { name: { contains: keyword, mode: "insensitive" } } },
                    { User: { email: { contains: keyword, mode: "insensitive" } } },
                ],
            }),
            ...(statuses.length && { status: { in: statuses } }),
        };

        const dir: "asc" | "desc" = query.orderBy === "asc" ? "asc" : "desc";
        const sortBy = query.sortBy || "createdAt";

        let orderBy:
            | Prisma.WithdrawalRequestOrderByWithRelationInput
            | Prisma.WithdrawalRequestOrderByWithRelationInput[] = { createdAt: dir };

        switch (sortBy) {
            case "amount":
                orderBy = { amount: dir };
                break;


            case "createdAt":
                orderBy = { createdAt: dir };
                break;
            case "processedAt":
                orderBy = { processedAt: dir };
                break;
            default:
                orderBy = { createdAt: dir };
        }

        const [items, total] = await Promise.all([
            this.prismaService.withdrawalRequest.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    User_WithdrawalRequest_userIdToUser:
                        { select: { id: true, name: true, email: true } },


                },
            }),
            this.prismaService.withdrawalRequest.count({ where }),
        ]);
        const raws = items.map((item) => {
            const { User_WithdrawalRequest_userIdToUser, ...rest } = item
            return { ...rest, User: { ...User_WithdrawalRequest_userIdToUser } }
        })
        return {
            data: raws,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
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
                User_WithdrawalRequest_userIdToUser: {
                    select: {
                        name: true,
                        phone: true,
                        email: true,
                        avatar: true,
                        Wallet: {
                            select: {
                                bankName: true,
                                bankAccount: true,
                                balance: true,
                                accountHolder: true

                            }
                        }
                    }
                }
            }
        });
        if (!data) return null;


        return data

    }
    async changeStatusWidthDraw(body: UpdateWithDrawalBodyType, userId: number) {
        const { id, ...rest } = body



        if (body.status === WithdrawalStatus.COMPLETED) {
            const withdrawalRequest = await this.prismaService.withdrawalRequest.update({
                where: {
                    id
                }, data: {
                    ...rest,
                    processedAt: new Date(),
                    processedById: userId,
                    PaymentTransaction: {

                        update: {
                            status: PaymentTransactionStatus.SUCCESS
                        }
                    }
                },
            })
            return await this.prismaService.wallet.update({
                where: {
                    userId: withdrawalRequest.userId
                },
                data: {
                    balance: {
                        decrement: withdrawalRequest.amount
                    }
                }
            })
        } else {

            const withdrawalRequest = await this.prismaService.withdrawalRequest.update({
                where: {
                    id
                }, data: {
                    ...rest,
                    processedAt: new Date(),
                    processedById: userId,
                    PaymentTransaction: {
                        update: {
                            status: PaymentTransactionStatus.SUCCESS
                        }
                    }
                },
            })
            return withdrawalRequest
        }
    }

    async getListReport(query: GetListReportQueryType) {
        const { page, limit, sortBy, orderBy, status } = query;

        const where: Prisma.BookingReportWhereInput = {};

        if (status) {
            where.status = Array.isArray(status)
                ? { in: status }
                : status;
        }

        const [total, data] = await Promise.all([
            this.prismaService.bookingReport.count({ where }),
            this.prismaService.bookingReport.findMany({
                where,
                include: {
                    CustomerProfile: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    phone: true,
                                    email: true,
                                    avatar: true,

                                }
                            }
                        }
                    },
                    ServiceProvider: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    phone: true,
                                    email: true,
                                    avatar: true,
                                }
                            }
                        }
                    }
                },
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
    async getReportDetail(reportId: number) {
        const data = await this.prismaService.bookingReport.findUnique({
            where: {
                id: reportId
            },
            include: {
                Booking: {

                    include: {
                        transaction: true,
                        ServiceRequest: {
                            include: {
                                PaymentTransaction: true
                            }
                        },
                        Proposal: {
                            include: {
                                ProposalItem: {
                                    include: {
                                        Service: true
                                    }
                                }
                            }
                        }
                    }
                },
                CustomerProfile: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                phone: true,
                                email: true,
                                avatar: true,

                            }
                        }
                    }
                },
                ServiceProvider: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                phone: true,
                                email: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
        })

        return data
    }

    async updateReport(body: UpdateProviderReportType, userId: number) {

        const { id, reporterId, amount, reporterType, ...rest } = body;
        if (body.status === ReportStatus.RESOLVED) {
            return this.prismaService.$transaction(async (tx) => {
                await tx.wallet.update({
                    where: { userId: reporterId },
                    data: { balance: { increment: amount } },
                    select: { id: true },
                });


                const report = await tx.bookingReport.update({
                    where: { id },
                    data: {

                        ...rest,
                        reviewedAt: new Date(),
                        reviewedById: userId,

                        PaymentTransaction: {
                            create: {
                                gateway: 'INTERNAL_WALLET',
                                status: PaymentTransactionStatus.REFUNDED,
                                userId: body.reporterId,
                                transactionDate: new Date(),
                                amountIn: amount,
                                referenceNumber: 'REFUND_RB',
                                transactionContent: 'Hoàn tiền báo cáo dịch vụ',
                            },
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                        reviewedAt: true,
                        reviewedById: true,
                        bookingId: true,


                    },
                });
                const trx = await tx.transaction.findUnique({
                    where: { bookingId: report.bookingId }
                });
                if (reporterType === RoleName.Customer) {
                    if (trx) {

                        await tx.transaction.update({
                            where: {

                                bookingId: report.bookingId
                            }
                            , data: {
                                booking: {
                                    update: {
                                        status: BookingStatus.COMPLETED
                                    }
                                },
                                status: PaymentStatus.REFUNDED
                            }
                        })







                    }


                }


                return report;
            });
        }
        return this.prismaService.bookingReport.update({
            where: {
                id: body.id
            }, data: {
                ...rest
            }
        })

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