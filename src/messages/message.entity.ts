import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  roomName: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
