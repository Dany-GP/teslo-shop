import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {

  }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'seed executed!!!';
  }

  private async insertUsers() {
    const seedUsers = initialData.seedusers;

    const users: User[] = [];

    seedUsers.forEach(x => {

      const { password, ...userData } = x;

      users.push(this.userRepository
        .create({
          ...userData,
          password: bcrypt.hashSync(password, 10)
        }));
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises = [];

    products.forEach(x => {
      insertPromises.push(this.productsService.create(x, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
