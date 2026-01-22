import { describe, it, expect, vi, beforeEach } from 'vitest';
import { academicService } from '../academic-service';
import { prisma } from '@/lib/db';

// Simple mock
vi.mock('@/lib/db', () => ({
    prisma: {
        course: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        batch: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        department: {
            create: vi.fn(),
        },
        semester: {
            create: vi.fn(),
        }
    },
}));

describe('academicService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCourse', () => {
        it('should create a course successfully', async () => {
            const mockCourse = { id: '1', name: 'Alim', createdAt: new Date(), updatedAt: new Date() };
            // @ts-ignore
            prisma.course.create.mockResolvedValue(mockCourse);

            const result = await academicService.createCourse('Alim');

            expect(prisma.course.create).toHaveBeenCalledWith({
                data: { name: 'Alim' },
            });
            expect(result).toEqual(mockCourse);
        });
    });

    describe('getBatches', () => {
        it('should return batches with relations', async () => {
            const mockBatches = [
                { id: '1', name: 'Batch A', type: 'SEMESTER', gender: 'MALE' }
            ];
            // @ts-ignore
            prisma.batch.findMany.mockResolvedValue(mockBatches);

            const result = await academicService.getBatches();

            expect(prisma.batch.findMany).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Batch A');
        });
    });
});
