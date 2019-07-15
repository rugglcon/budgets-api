import { ValueTransformer } from 'typeorm';

export const decimal: ValueTransformer = {
    to: (eValue: number) => eValue,
    from: (dbValue: string) => Number(dbValue)
};
