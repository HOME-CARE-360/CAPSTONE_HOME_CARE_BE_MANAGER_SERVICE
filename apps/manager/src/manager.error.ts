import {
    UnprocessableEntityException,
    BadRequestException,
    ConflictException, // (tuỳ chọn) dùng cho "already exists"
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

// 409 CONFLICT hợp lý cho "already exists" (có thể giữ UnprocessableEntity nếu bạn muốn)
export const ServiceProviderAlreadyExistsException = new RpcException(
    // new UnprocessableEntityException([
    new ConflictException([
        { message: 'Service provider already exists (duplicate taxId or name)', path: ['taxId', 'name'] },
    ]),
);

export const SameVerificationStatusException = new RpcException(
    new BadRequestException([
        { message: 'Verification status is the same as current status', path: ['verificationStatus'] },
    ]),
);

export const NoteRequiredForResolvedStatusException = new RpcException(
    new BadRequestException([
        { message: 'Note is required when status is RESOLVED', path: ['note'] },
    ]),
);

export const ReportHasAlreadyBeenResolvedException = new RpcException(
    new BadRequestException([
        { message: 'Report has already been resolved', path: ['reportId'] },
    ]),
);

export const InvalidCompanyTypeException = new RpcException(
    new BadRequestException([
        { message: 'Invalid company type', path: ['companyType'] },
    ]),
);

export const UserAlreadyLinkedToProviderException = new RpcException(
    new UnprocessableEntityException([
        { message: 'User is already linked to a service provider', path: ['userId'] },
    ]),
);

export const AmountAndReporterIdAreRequiredException = new RpcException(
    new UnprocessableEntityException([
        { message: 'amount and reporterId are required when status is RESOLVED', path: ['status'] },
    ]),
);
