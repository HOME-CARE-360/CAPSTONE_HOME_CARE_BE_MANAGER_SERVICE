import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";




export const ServiceNotFoundException = new RpcException(new UnprocessableEntityException([
    {
        message: 'Error.ServiceNotFound',
        path: 'serviceId',
    },
]))

export function InvalidServiceIdException(serviceIds: number[]) {
    return new RpcException(new BadRequestException([
        {
            message: 'Error.InvalidServiceId',
            path: ['categoryRequirements'],
            meta: { serviceIds },
        },
    ]));
}