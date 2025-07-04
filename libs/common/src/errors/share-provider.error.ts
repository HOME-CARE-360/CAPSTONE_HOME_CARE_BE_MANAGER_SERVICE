import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export const ServiceProviderNotFoundException =
    new RpcException(new NotFoundException([
        { message: 'Error.ServiceProviderNotFound', path: ['id'] },
    ])
    )

export const MissingProviderIdException = new RpcException(new UnauthorizedException({
    message: 'Error.MissingProviderId',
    path: ['providerId'],
}))

export const ProviderNotVerifiedException = new RpcException(new ForbiddenException({
    message: 'Error.ProviderNotVerified',
    path: ['providerId'],
}))
