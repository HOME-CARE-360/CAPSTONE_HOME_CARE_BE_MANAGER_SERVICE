import { BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export const ServiceNotFoundException = new RpcException(
    new UnprocessableEntityException([
        {
            message: 'Service not found',
            path: 'serviceId',
        },
    ]),
);

export function InvalidServiceIdException(serviceIds: number[]) {
    return new RpcException(
        new BadRequestException([
            {
                message: `Invalid service ID(s): ${serviceIds.join(', ')}`,
                path: ['categoryRequirements'],
                meta: { serviceIds },
            },
        ]),
    );
}
