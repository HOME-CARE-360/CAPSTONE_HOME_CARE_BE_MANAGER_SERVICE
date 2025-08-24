import { Controller } from '@nestjs/common';
import { ManagersService } from './managers.service';

import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'libs/common/src/dtos/response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCategoryBodyType, UpdateCategoryBodyType } from 'libs/common/src/request-response-type/category/category.model';
import { GetListProviderQueryType, UpdateStatusProviderBodyType, UpdateStatusServiceBodyType } from 'libs/common/src/request-response-type/manager/manager.model';
import { GetListWidthDrawQueryType, UpdateWithDrawalBodyType } from 'libs/common/src/request-response-type/with-draw/with-draw.model';
import { GetListReportQueryType, UpdateProviderReportType } from 'libs/common/src/request-response-type/report/report.model';
import { GetServicesForManagerQueryType } from 'libs/common/src/request-response-type/service/services.model';

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

  @MessagePattern({ cmd: "get-list-withdraw" })
  @ZodSerializerDto(MessageResDTO)
  async getListWithDraw(@Payload() query: GetListWidthDrawQueryType) {
    return await this.managersService.getListWithDraw(query)

  }
  @MessagePattern({ cmd: "get-list-service" })
  @ZodSerializerDto(MessageResDTO)
  async getListService(@Payload() query: GetServicesForManagerQueryType) {
    console.log("vao r");
    console.log(query);

    return await this.managersService.getListService(query)

  }
  @MessagePattern({ cmd: "get-withdraw-detail" })
  @ZodSerializerDto(MessageResDTO)
  async getWithDrawDetail(@Payload() { id }: { id: number }) {
    return await this.managersService.getWithDrawDetail(id)

  }
  @MessagePattern({ cmd: "update-withdraw" })
  @ZodSerializerDto(MessageResDTO)
  async changeStatusWithDraw(@Payload() { userId, body }: { userId: number, body: UpdateWithDrawalBodyType }) {
    await this.managersService.changeStatusWithDraw(body, userId)
    return {
      message: "Change status withdraw successfully"
    }

  }
  @MessagePattern({ cmd: "get-list-report" })
  @ZodSerializerDto(MessageResDTO)
  async getListReport(@Payload() { query }: { query: GetListReportQueryType }) {
    return await this.managersService.getListReport(query)

  }
  @MessagePattern({ cmd: "update-report" })
  @ZodSerializerDto(MessageResDTO)
  async updateReport(@Payload() { data, reportId, userId }: { data: UpdateProviderReportType, userId: number, reportId: number }) {
    return await this.managersService.updateReport(data, reportId, userId)

  }
  @MessagePattern({ cmd: "get-list-provider" })
  @ZodSerializerDto(MessageResDTO)
  async getListProvider(@Payload() { query }: { query: GetListProviderQueryType }) {
    return await this.managersService.getListProvider(query)

  }
  @MessagePattern({ cmd: "get-report-detail" })
  @ZodSerializerDto(MessageResDTO)
  async getReportDetail(@Payload() { reportId }: { reportId: number }) {
    return await this.managersService.getReportDetail(reportId)

  }
}
