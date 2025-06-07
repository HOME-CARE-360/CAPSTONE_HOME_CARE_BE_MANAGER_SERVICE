import { Injectable } from '@nestjs/common';
import { UpdateStatusProviderBody } from 'libs/common/src/request-response-type/manager/manager.model';

import { SameVerificationStatusException } from './manager.error';
import { ManagerRepository } from './managers.repo';
import { SharedProviderRepository } from 'libs/common/src/repositories/share-provider.repo';
import { ServiceProviderNotFoundException } from 'libs/common/src/errors/share-provider.error';

@Injectable()
export class ManagersService {
  constructor(

    private readonly sharedProviderRepository: SharedProviderRepository,
    private readonly managerRepository: ManagerRepository,
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

}
