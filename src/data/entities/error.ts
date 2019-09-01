import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class JSError {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userAgent: string;

    @Column({
        type: 'text',
        nullable: false
    })
    stackTrace: string;

    @Column({
        type: 'datetime',
        nullable: false
    })
    timestamp: Date;

    @Column({
        type: 'varchar',
        length: 45,
        nullable: false
    })
    ipAddress: string;

    @Column()
    userId: number;
}
