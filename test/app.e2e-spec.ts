import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ANIMALTYPE } from './../db/types';
import { Knex } from 'knex';
import { clearDatabase, closeKnex } from './../db/database';
import { AnimalsDatabaseAdapter } from './../src/animals/animals.db.adapter';
import { AnimalsModule } from './../src/animals/animals.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    if (process.env.NODE_ENV !== 'testing') {
      throw new Error('Please change your environment to "testing"');
    }
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
    closeKnex();
    console.log('app closed...');
  });

  it('/GET animals', async () => {
    return await request(app.getHttpServer())
      .get('/animals')
      .expect(HttpStatus.OK);
  });

  it('/POST animal', async () => {
    return await request(app.getHttpServer())
      .post('/animals')
      .send([{ name: 'FAKE_ANIMAL', type: ANIMALTYPE.BIRD }])
      .expect(HttpStatus.CREATED);
  });

  it('/UPDATE animal', async () => {
    await request(app.getHttpServer())
      .post('/animals')
      .send([
        { name: 'FAKE_ANIMAL', type: ANIMALTYPE.INSECT },
        { name: 'FAKE_ANIMAL_2', type: ANIMALTYPE.BIRD },
      ]);
    const animalDbAdapter = app.get('IDatabaseAdapter');
    const animals = await animalDbAdapter.getAll();
    await request(app.getHttpServer())
      .patch(`/animals/${animals.at(-1).id}`)
      .send({ name: 'UPDATED_FAKE_ANIMAL' })
      .expect(204);
    const animalsAfterUpdate = await animalDbAdapter.getAll();
    expect(animalsAfterUpdate.at(-1).name).toBe('UPDATED_FAKE_ANIMAL');
  });

  it('/DELETE animal', async () => {
    const animalDbAdapter = app.get('IDatabaseAdapter');
    await animalDbAdapter.addOne({ name: 'FAKE_NAME', type: 'bird' });
    const animals = await animalDbAdapter.getAll();
    await request(app.getHttpServer())
      .delete(`/animals/${animals[0].id}`)
      .expect(204);
    const animalsAfterDelete = await animalDbAdapter.getAll();
    expect(animalsAfterDelete.length).toBe(0);
  });
});
