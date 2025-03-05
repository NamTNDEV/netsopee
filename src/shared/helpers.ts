import { Prisma } from "@prisma/client";

// Type Predicate for Prisma unique constraint error
export const usUniqueConstraintPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
};

export const isNotFoundPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}