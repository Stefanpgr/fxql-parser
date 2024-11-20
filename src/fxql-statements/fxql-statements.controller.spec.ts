import { Test, TestingModule } from '@nestjs/testing';
import { FxqlStatementsController } from './fxql-statements.controller';
import { FxqlStatementsService } from './fxql-statements.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { PrismaService } from '../prisma.service';

describe('FxqlStatementsController', () => {
  let controller: FxqlStatementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxqlStatementsController],
      providers: [FxqlStatementsService, PrismaService],
    }).compile();

    controller = module.get<FxqlStatementsController>(FxqlStatementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('FXQLController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('[POST] /fxql-statements -> Valid FXQL', () => {
    const fxql = `USD-GBP {\\n BUY 100\\n SELL 0.04590\\n CAP 1000\\n}`;
    return request(app.getHttpServer())
      .post('/fxql-statements')
      .send({ FXQL: fxql })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Rates Parsed Successfully.');
      });
  });


  it('[POST] /fxql-statements -> Missing FXQL field', () => {
    return request(app.getHttpServer())
      .post('/fxql-statements')
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(["FXQL should not be empty"]);
      });
  });

  

  afterAll(async () => {
    await app.close();
  });
});