import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ProPertyType } from '@prisma/client';
import { User } from 'src/user/decorator/user.decorator';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }
    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: ProPertyType
    ): Promise<HomeResponseDto[]> {
        // we are actually going to utilize this query params to filter our database.
        // console.log({ city, minPrice, maxPrice, propertyType })
        const price = minPrice || maxPrice ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
        } : undefined
        const filters = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        }
        return this.homeService.getHomes(filters)
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) id: number) {
        return this.homeService.getHomeById(id);
    }

    @Post()
    createHome(@Body() body: CreateHomeDto, @User() user) {
        return 'hello'
        // return this.homeService.createHome(body)
    }

    @Put(':id')
    updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto
    ) {
        return this.homeService.updateHome(id, body)
    }
    @Delete(':id')
    deleteHome(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.homeService.deleteHome(id)
    }

}
