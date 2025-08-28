import {
    UnprocessableEntityException,
    BadRequestException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';



export const ServiceProviderAlreadyExistsException = new RpcException(
    new UnprocessableEntityException([
        { message: 'Error.ServiceProviderAlreadyExists', path: ['taxId', 'name'] },
    ])
);

export const SameVerificationStatusException = new RpcException(
    new BadRequestException([
        { message: 'Error.SameVerificationStatus', path: ['verificationStatus'] },
    ])
);
export const NoteRequiredForResolvedStatusException = new RpcException(
    new BadRequestException([
        { message: 'Error.NoteRequiredForResolvedStatus', path: ['note'] },
    ])
);
export const ReportHasAlreadyBeenResolvedException = new RpcException(
    new BadRequestException([
        { message: 'Report has already been resolved', path: ['reportId'] },
    ])
);

export const InvalidCompanyTypeException = new RpcException(
    new BadRequestException([
        { message: 'Error.InvalidCompanyType', path: ['companyType'] },
    ])
);

export const UserAlreadyLinkedToProviderException = new RpcException(
    new UnprocessableEntityException([
        { message: 'Error.UserAlreadyLinkedToProvider', path: ['userId'] },
    ])
);
export const AmountAndReporterIdAreRequiredException = new RpcException(
    new UnprocessableEntityException([
        { message: 'Amount and reporterId are required when status = RESOLVED', path: ['status'] },
    ])
);

