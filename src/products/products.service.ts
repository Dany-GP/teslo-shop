import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSoruce: DataSource
  ) { }


  async create(createProductDto: CreateProductDto, user: User) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create(
        {
          ...productDetails,
          images: images.map(img => (this.productImageRepository.create({ url: img }))),
          user
        }
      );
      await this.productRepository.save(product);
      return { ...product, images };

    } catch (error) {

      this._handleExceptions(error);
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository
      .find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });

    return products.map(prod => (
      {
        ...prod,
        images: prod.images.map(image => image.url)
      }
    ));
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {

      product = await this.productRepository.findOne({
        where: {
          id: term
        }
      });

    } else {

      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where(`LOWER(title) =:title or slug =:slug`, {
          title: term.toLowerCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();

      // product = await this.productRepository.findOne({
      //   where: {
      //     slug: term
      //   }
      // });
    }


    console.log(product);

    if (product) {
      return product;
    } else {
      throw new NotFoundException(`Product with id ${term} not exists`);
    }
  }

  async findOnePlain(term: string) {
    const { images, ...prod } = await this.findOne(term);

    return {
      ...prod,
      images: images.map(img => img.url)
    }

  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const queryRunner = this.dataSoruce.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const { images, ...toUpdate } = updateProductDto;

      const prod = await this.productRepository.preload({
        id: id,
        ...toUpdate
      });

      if (!prod) {
        throw new NotFoundException(`Product with id ${id} not exists`)
      } else {



        if (images) {

          await queryRunner.manager.delete(ProductImage, { product: { id } });
          prod.images = images.map(image =>
            this.productImageRepository.create({ url: image })
          );

        }


        prod.user = user;
        await queryRunner.manager.save(prod);
        await queryRunner.commitTransaction();
        await queryRunner.release();

        return this.findOnePlain(id);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this._handleExceptions(error)
    }


    //return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      if (product)
        await this.productRepository.remove(product);
      //return new NotFoundException(`Product with id ${id} not exists`);
    } catch (error) {
      console.log(error);
      this._handleExceptions(error);
    }

  }

  private _handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error.detail);
    throw new InternalServerErrorException('Unexpected error, check server logs.');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this._handleExceptions(error);
    }

  }

}
