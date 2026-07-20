import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LegalService } from './legal.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Legal Documents & Insurance')
@ApiBearerAuth('JWT-auth')
@Controller('api/legal')
@UseGuards(JwtAuthGuard)
export class LegalController {
  constructor(private legalService: LegalService) {}

  @Get(':vehicleId')
  @ApiOperation({ summary: 'Lấy danh sách giấy tờ và bảo hiểm của xe' })
  @ApiParam({ name: 'vehicleId', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về danh sách giấy tờ pháp lý.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập xe này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  async findAll(@Param('vehicleId', ParseIntPipe) vehicleId: number, @User() user: any) {
    return this.legalService.findAllByVehicle(vehicleId, user.userId, user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Đăng ký giấy tờ pháp lý / hợp đồng bảo hiểm mới' })
  @ApiResponse({ status: 201, description: 'Thêm mới thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 409, description: 'Loại giấy tờ đã tồn tại trên xe.' })
  async create(@User() user: any, @Body() dto: CreateDocumentDto) {
    return this.legalService.create(user.userId, user.role, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hoặc gia hạn chu kỳ thời hạn của giấy tờ' })
  @ApiParam({ name: 'id', description: 'ID của giấy tờ', type: Number })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa giấy tờ này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giấy tờ.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.legalService.update(id, user.userId, user.role, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giấy tờ khỏi hệ thống' })
  @ApiParam({ name: 'id', description: 'ID của giấy tờ', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa giấy tờ này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giấy tờ.' })
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.legalService.delete(id, user.userId, user.role);
  }
}
