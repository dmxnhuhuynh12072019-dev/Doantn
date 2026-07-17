import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let dbService: DatabaseService;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    dbService = module.get<DatabaseService>(DatabaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all vehicles if user is Admin', async () => {
      const mockVehicles = [{ VehicleID: 1, UserID: 3, Brand: 'Toyota' }];
      mockDatabaseService.query.mockResolvedValue({ recordset: mockVehicles });

      const result = await service.findAll(1, 'Admin');

      expect(result).toEqual(mockVehicles);
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM Vehicles ORDER BY UpdatedAt DESC'
      );
    });

    it('should return only user vehicles if user is not Admin', async () => {
      const mockVehicles = [{ VehicleID: 1, UserID: 3, Brand: 'Toyota' }];
      mockDatabaseService.query.mockResolvedValue({ recordset: mockVehicles });

      const result = await service.findAll(3, 'User');

      expect(result).toEqual(mockVehicles);
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM Vehicles WHERE UserID = @userId ORDER BY UpdatedAt DESC',
        [{ name: 'userId', type: sql.Int, value: 3 }]
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle if found and owner matches', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, Brand: 'Toyota' };
      mockDatabaseService.query.mockResolvedValue({ recordset: [mockVehicle] });

      const result = await service.findOne(1, 3, 'User');

      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockDatabaseService.query.mockResolvedValue({ recordset: [] });

      await expect(service.findOne(99, 3, 'User')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if vehicle does not belong to user', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, Brand: 'Toyota' };
      mockDatabaseService.query.mockResolvedValue({ recordset: [mockVehicle] });

      await expect(service.findOne(1, 4, 'User')).rejects.toThrow(ForbiddenException);
    });

    it('should allow Admin to view vehicle owned by others', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, Brand: 'Toyota' };
      mockDatabaseService.query.mockResolvedValue({ recordset: [mockVehicle] });

      const result = await service.findOne(1, 4, 'Admin');
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('create', () => {
    it('should create a vehicle if license plate is unique', async () => {
      mockDatabaseService.query
        .mockResolvedValueOnce({ recordset: [] }) // select check
        .mockResolvedValueOnce({ recordset: [{ VehicleID: 5 }] }); // insert output

      const dto = {
        licensePlate: '59A-111.11',
        vehicleType: 'Ô tô',
        brand: 'Ford',
        model: 'Raptor',
        manufactureYear: 2022,
        purchaseDate: '2022-01-01',
        currentOdometer: 10000,
      };

      const result = await service.create(3, dto);

      expect(result).toEqual({
        message: 'Thêm phương tiện mới thành công!',
        vehicleId: 5,
      });
    });

    it('should throw ConflictException if license plate exists', async () => {
      mockDatabaseService.query.mockResolvedValueOnce({ recordset: [{ VehicleID: 1 }] });

      const dto = {
        licensePlate: '59A-123.45',
        vehicleType: 'Ô tô',
        brand: 'Toyota',
        model: 'Vios',
        currentOdometer: 35200,
      };

      await expect(service.create(3, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update vehicle successfully', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, Brand: 'Toyota' };
      mockDatabaseService.query
        .mockResolvedValueOnce({ recordset: [mockVehicle] }) // findOne
        .mockResolvedValueOnce({}); // update

      const dto = {
        brand: 'Honda',
        model: 'Civic',
        manufactureYear: 2021,
        purchaseDate: '2021-01-01',
      };

      const result = await service.update(1, 3, 'User', dto);

      expect(result).toEqual({ message: 'Cập nhật thông tin phương tiện thành công!' });
    });

    it('should throw ForbiddenException if user tries to update another user vehicle', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, Brand: 'Toyota' };
      mockDatabaseService.query.mockResolvedValueOnce({ recordset: [mockVehicle] });

      const dto = {
        brand: 'Honda',
        model: 'Civic',
      };

      await expect(service.update(1, 4, 'User', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateOdometer', () => {
    it('should update odometer successfully if new value >= current', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, CurrentOdometer: 10000, Brand: 'Toyota' };
      mockDatabaseService.query
        .mockResolvedValueOnce({ recordset: [mockVehicle] }) // findOne
        .mockResolvedValueOnce({}); // update

      const result = await service.updateOdometer(1, 3, 'User', { currentOdometer: 12000 });

      expect(result).toEqual({ message: 'Cập nhật số km (Odometer) thành công!' });
    });

    it('should throw ConflictException if new odometer is less than current', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3, CurrentOdometer: 10000, Brand: 'Toyota' };
      mockDatabaseService.query.mockResolvedValueOnce({ recordset: [mockVehicle] });

      await expect(
        service.updateOdometer(1, 3, 'User', { currentOdometer: 9000 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete vehicle successfully', async () => {
      const mockVehicle = { VehicleID: 1, UserID: 3 };
      mockDatabaseService.query
        .mockResolvedValueOnce({ recordset: [mockVehicle] }) // findOne
        .mockResolvedValueOnce({}) // delete MaintenanceHistory
        .mockResolvedValueOnce({}) // delete Appointments
        .mockResolvedValueOnce({}); // delete Vehicles

      const result = await service.delete(1, 3, 'User');

      expect(result).toEqual({ message: 'Xóa phương tiện thành công!' });
    });
  });
});
