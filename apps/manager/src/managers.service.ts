import { Injectable } from '@nestjs/common';
import { UpdateStatusProviderBody } from 'libs/common/src/request-response-type/manager/manager.model';

import { SameVerificationStatusException } from './manager.error';
import { ManagerRepository } from './managers.repo';
import { SharedProviderRepository } from 'libs/common/src/repositories/share-provider.repo';
import { ServiceProviderNotFoundException } from 'libs/common/src/errors/share-provider.error';
import { CreateCategoryBodyType } from 'libs/common/src/request-response-type/category/category.model';
import { SharedCategoryRepository } from 'libs/common/src/repositories/shared-category.repo';
import { CategoryAlreadyExistException, InvalidCategoryIdException } from 'libs/common/src/errors/share-category.error';

@Injectable()
export class ManagersService {
  constructor(

    private readonly sharedProviderRepository: SharedProviderRepository,
    private readonly managerRepository: ManagerRepository,
    private readonly categoriesRepository: SharedCategoryRepository
  ) { }
  async updateProviderStatus(body: UpdateStatusProviderBody, userId: number) {
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
  async createCategory(body: CreateCategoryBodyType, userId: number) {
    if ((await this.categoriesRepository.findUniqueName([body.name])).length > 0) throw CategoryAlreadyExistException([body.name])
    return await this.categoriesRepository.createCategory(body, userId)
  }
  async updateCategory(body: CreateCategoryBodyType, userId: number, categoryId: number) {
    const [categoryDbId, categoryDbName] = await Promise.all([this.categoriesRepository.findUnique([categoryId]), this.categoriesRepository.findUniqueName([body.name])])
    if (categoryDbId.length > 0) throw InvalidCategoryIdException([categoryId])
    if (categoryDbName.length > 0) throw CategoryAlreadyExistException([body.name])
    return await this.categoriesRepository.createCategory(body, userId)
  }

}
