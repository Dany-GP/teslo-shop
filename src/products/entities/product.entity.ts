import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '065c73eb-91d0-460b-b570-3d9d57d76a99',
        description: 'Product id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty(
        {
            example: 'Shirt teslo',
            description: 'Product title',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty(
        {
            example: 0,
            description: 'Product price',
            uniqueItems: false
        }
    )
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty(
        {
            example: 'this is a description',
            description: 'Product description',
            uniqueItems: false,
            default: null
        }
    )
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty()
    @Column({
        type: 'text',
        unique: true
    })
    slug: string;


    @ApiProperty()
    @Column({
        type: 'int',
        default: 0
    })
    stock: number;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true
    })
    sizes: string[];

    @ApiProperty()
    @Column({
        type: 'text'
    })
    gender: string;

    @ApiProperty()
    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[];


    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ApiProperty()
    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;


    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", '');
            //.replace(/ /g, '_')
            //.replace(/'/g, '')
        } else {
            this.slug = this.slug
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", '');
        }
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        if (!this.slug) {
            this.slug = this.title
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", '');
            //.replace(/ /g, '_')
            //.replace(/'/g, '')
        } else {
            this.slug = this.slug
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", '');
        }
    }

}
