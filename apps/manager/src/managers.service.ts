import { Injectable } from '@nestjs/common';
import { GetListProviderQueryType, UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from 'libs/common/src/request-response-type/manager/manager.model';

import { NoteRequiredForResolvedStatusException, SameVerificationStatusException } from './manager.error';
import { ManagerRepository } from './managers.repo';
import { SharedProviderRepository } from 'libs/common/src/repositories/share-provider.repo';
import { ServiceProviderNotFoundException } from 'libs/common/src/errors/share-provider.error';
import { CreateCategoryBodyType, UpdateCategoryBodyType } from 'libs/common/src/request-response-type/category/category.model';
import { SharedCategoryRepository } from 'libs/common/src/repositories/shared-category.repo';
import { CategoryAlreadyExistException, InvalidCategoryIdException } from 'libs/common/src/errors/share-category.error';
import { GetListWidthDrawQueryType, UpdateWithDrawalBodyType } from 'libs/common/src/request-response-type/with-draw/with-draw.model';
import { GetListReportQueryType, UpdateProviderReportType } from 'libs/common/src/request-response-type/report/report.model';
import { ReportStatus } from '@prisma/client';
import { GetServicesForManagerQueryType } from 'libs/common/src/request-response-type/service/services.model';

@Injectable()
export class ManagersService {
  constructor(

    private readonly sharedProviderRepository: SharedProviderRepository,
    private readonly managerRepository: ManagerRepository,
    private readonly categoriesRepository: SharedCategoryRepository
  ) { }
  async updateProviderStatus(body: UpdateStatusProviderBodyType, userId: number) {
    const provider = await this.sharedProviderRepository.findUnique({ id: body.id })
    if (!provider) {
      throw ServiceProviderNotFoundException
    }
    if (provider?.verificationStatus === body.verificationStatus) {
      throw SameVerificationStatusException
    }

    await this.managerRepository.acceptProvider(body, userId)
    return {
      message: "Change status provider successfully"
    }

  }
  async updateServiceStatus(body: UpdateStatusServiceBodyType) {

    await this.managerRepository.updateStatusService(body)
    return {
      message: "Change status service successfully"
    }

  }
  async createCategory(body: CreateCategoryBodyType, userId: number) {
    if ((await this.categoriesRepository.findUniqueName([body.name])).length > 0) throw CategoryAlreadyExistException([body.name])
    return await this.categoriesRepository.createCategory(body, userId)
  }
  async updateCategory(body: UpdateCategoryBodyType, userId: number, categoryId: number) {
    const [categoryDbId, categoryDbName] = await Promise.all([this.categoriesRepository.findUnique([categoryId]), this.categoriesRepository.findUniqueName([body.name])])
    if (categoryDbId.length < 1) throw InvalidCategoryIdException([categoryId])
    if (categoryDbName.length > 1) throw CategoryAlreadyExistException([body.name])
    return await this.categoriesRepository.updateCategory(body, userId, categoryId)
  }
  async deleteCategory(userId: number, categoryId: number) {

    if ((await this.categoriesRepository.findUnique([categoryId])).length < 1) throw InvalidCategoryIdException([categoryId])
    return await this.categoriesRepository.deleteCategory(userId, categoryId)
  }
  async getListWithDraw(query: GetListWidthDrawQueryType) {
    return await this.managerRepository.getListWithDraw(query)
  }
  async getWithDrawDetail(id: number) {
    return await this.managerRepository.getWithDrawDetail(id)
  }
  async changeStatusWithDraw(body: UpdateWithDrawalBodyType, userId: number) {
    return await this.managerRepository.changeStatusWidthDraw(body, userId)
  }
  async getListReport(query: GetListReportQueryType) {
    return await this.managerRepository.getListReport(query)
  }
  async updateReport(body: UpdateProviderReportType, userId: number) {
    if (body.status === ReportStatus.RESOLVED && !body.note) {
      throw NoteRequiredForResolvedStatusException
    }
    return await this.managerRepository.updateReport(body, userId)
  }
  async getListProvider(query: GetListProviderQueryType) {
    return await this.managerRepository.getListProvider(query)
  }
  async getListService(query: GetServicesForManagerQueryType) {
    return await this.managerRepository.list({ ...query })
  }
  async getReportDetail(reportId: number) {
    return await this.managerRepository.getReportDetail(reportId)
  }
}
