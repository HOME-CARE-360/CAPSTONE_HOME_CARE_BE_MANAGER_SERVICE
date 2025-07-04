import { Controller } from '@nestjs/common';
import { ManagersService } from './managers.service';

import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'libs/common/src/dtos/response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCategoryBodyType, UpdateCategoryBodyType } from 'libs/common/src/request-response-type/category/category.model';
import { UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from 'libs/common/src/request-response-type/manager/manager.model';

@ApiBearerAuth()
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) { }
  @MessagePattern({ cmd: 'change-status-provider' })
  @ZodSerializerDto(MessageResDTO)
  async updateStatusProvider(@Payload() { body, id }: { body: UpdateStatusProviderBodyType, id: number }) {
    return this.managersService.updateProviderStatus(body, id)
  }
  @MessagePattern({ cmd: 'change-status-service' })
  @ZodSerializerDto(MessageResDTO)
  async updateStatusService(@Payload() { body }: { body: UpdateStatusServiceBodyType }) {
    return this.managersService.updateServiceStatus(body)
  }
  @MessagePattern({ cmd: "create-category" })
  @ZodSerializerDto(MessageResDTO)
  async createCategory(@Payload() { body, userId }: { body: CreateCategoryBodyType, userId: number }) {
    await this.managersService.createCategory(body, userId);
    return {
      message: "Create category successfully"
    }
  }
  @MessagePattern({ cmd: "update-category" })
  @ZodSerializerDto(MessageResDTO)
  async updateCategory(@Payload() { body, userId, categoryId }: { body: UpdateCategoryBodyType, userId: number, categoryId: number }) {
    await this.managersService.updateCategory(body, userId, categoryId);
    return {
      message: "Update category successfully"
    }
  }
  @MessagePattern({ cmd: "delete-category" })
  @ZodSerializerDto(MessageResDTO)
  async Category(@Payload() { userId, categoryId }: { userId: number, categoryId: number }) {
    await this.managersService.deleteCategory(userId, categoryId);
    return {
      message: "Delete category successfully"
    }
  }

}
