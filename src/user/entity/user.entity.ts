import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: string;

  @Column({
    length: 83,
  })
  name: string;

  @Column({
    length: 127,
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birth_date: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

  @Column({
    enum: ['1', '2'], // 1 = user, 2 = admin
    default: '1',
  })
  role: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
