import { Injectable, NotFoundException } from '@nestjs/common';
import { ProPertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';

interface GetHomesParam {
    city?: string;
    propertyType?: ProPertyType;
    // price?: object
    price?: {
        gte?: number;
        lte?: number
    }
}

interface HomeData {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: ProPertyType;
    images: { url: string }[]
}

interface UpdateHomeData {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: ProPertyType;
}

export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) { }
    async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                listed_date: true,
                land_size: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                },
            },
            where: filter
        });
        if (!homes.length) {
            throw new NotFoundException
        }
        return homes.map((home) => {
            const fetchedHome = { ...home, image: home.images[0].url }
            // console.log({ home })
            // console.log({ fetchedHome })
            // console.log({ images: fetchedHome.images })
            //Added the image to the object and deleted the images array.
            delete fetchedHome.images
            return new HomeResponseDto(fetchedHome)

        });
    }

    async getHomeById(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id,
            },
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true,
                    },
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!home) {
            throw new NotFoundException();
        }

        return new HomeResponseDto(home);
    }

    // When our code gets here, it means that everything you sent to us is ok because of
    // our decorators.
    // Now use prisma to create home
    async createHome({ address, numberOfBathrooms,
        numberOfBedrooms, city, price, landSize, propertyType, images }: HomeData) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                price,
                land_size: landSize,
                propertyType,
                realtor_id: 5
            }
        })
        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id }
        })
        await this.prismaService.image.createMany({ data: homeImages })
        return new HomeResponseDto(home)
    }

    async updateHome(id: number, data: UpdateHomeData) {
        // Check for the home first.
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        })
        if (!home) {
            throw new NotFoundException()
        }
        const updatedHome = await this.prismaService.home.update({
            where: {
                id
            },
            data
        })
        return new HomeResponseDto(updatedHome)
    }

    async deleteHome(id) {
        await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        })
        await this.prismaService.home.delete({
            where: {
                id
            }
        })
    }

}


