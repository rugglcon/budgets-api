import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const TOKEN_LENGTH = 35;
export const TOKEN_CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: TOKEN_LENGTH
    })
    tokenString: string;
}
