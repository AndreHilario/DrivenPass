import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import faker from 'faker';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateNoteDto } from '../src/notes/dto/create-note.dto';
import { Note } from '../src/notes/entities/note.entity';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotesFactory } from './factories/notes.factory';
import { UsersFactory } from './factories/users.factory';
import { E2EUtils } from './utils/e2e-utils';

describe('SecureNotes E2E Tests', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();
  let notesFactory: NotesFactory;
  let usersFactory: UsersFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    notesFactory = new NotesFactory(prisma);
    usersFactory = new UsersFactory(prisma);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await E2EUtils.cleanDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('when token is not valid', () => {
    it('should return unauthorized when token is incorrect', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}w`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is missing', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .post('/notes')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('POST /notes => should create a note', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildNote(user.id);
      const { title, content, userId } = credential;

      const noteDto: CreateNoteDto = new Note(title, content, userId);
      const noteBody = {
        title: noteDto.title,
        content: noteDto.content,
        userId: noteDto.userId,
      };

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteBody)
        .expect(HttpStatus.CREATED);

      const notes = await prisma.secureNote.findMany();
      expect(notes).toHaveLength(1);

      const noteCreated = notes[0];

      expect(noteCreated).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        content: expect.any(String),
        userId: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('POST /notes => should not create a note when properties missing or wrong', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const noteDto: CreateNoteDto = new Note('', '', 0);
      const noteBody = {
        title: noteDto.title,
        content: noteDto.content,
        userId: noteDto.userId,
      };

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /notes => should not create a note when try to create when does not exist userId', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildNote(user.id);
      const { title, content } = credential;

      const noteDto: CreateNoteDto = new Note(title, content, 0);
      const noteBody = {
        title: noteDto.title,
        content: noteDto.content,
        userId: noteDto.userId,
      };

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteBody)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('POST /notes => should not create a note when try to create with another id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildNote(fakeUser.id);
      const { title, content, userId } = credential;

      const noteDto: CreateNoteDto = new Note(title, content, userId);
      const noteBody = {
        title: noteDto.title,
        content: noteDto.content,
        userId: noteDto.userId,
      };

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(noteBody)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('GET /notes => should return all notes from user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const firstNote = E2EUtils.buildNote(user.id);

      await notesFactory
        .withTitle(firstNote.title)
        .withContent(firstNote.content)
        .withUserId(firstNote.userId)
        .persist();

      const secondNote = E2EUtils.buildNote(user.id);

      await notesFactory
        .withTitle(secondNote.title)
        .withContent(secondNote.content)
        .withUserId(secondNote.userId)
        .persist();

      const thirdNote = E2EUtils.buildNote(fakeUser.id);

      await notesFactory
        .withTitle(thirdNote.title)
        .withContent(thirdNote.content)
        .withUserId(thirdNote.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toHaveLength(2);
      expect(body).toEqual([
        {
          id: expect.any(Number),
          title: expect.any(String),
          content: expect.any(String),
          userId: expect.any(Number),
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          updatedAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
        },
        {
          id: expect.any(Number),
          title: expect.any(String),
          content: expect.any(String),
          userId: expect.any(Number),
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          updatedAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
        },
      ]);
    });

    it('GET /note/:id => should get a specific note by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const note = E2EUtils.buildNote(user.id);

      const newNote = await notesFactory
        .withTitle(note.title)
        .withContent(note.content)
        .withUserId(note.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get(`/notes/${newNote.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        content: expect.any(String),
        userId: expect.any(Number),
        createdAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
      });
    });

    it('GET /notes/:id => should return not found when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get(`/notes/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('GET /notes => should not get a note when note "id" does not belong to current user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const note = E2EUtils.buildNote(fakeUser.id);

      await notesFactory
        .withTitle(note.title)
        .withContent(note.content)
        .withUserId(note.userId)
        .persist();

      request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /notes/:id => should not delete a note when "id" does not belong to the current user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const note = E2EUtils.buildNote(fakeUser.id);

      const newNote = await notesFactory
        .withTitle(note.title)
        .withContent(note.content)
        .withUserId(note.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/notes/${newNote.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /notes/:id => should not delete a specific note when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/notes/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('DELETE /notes/:id => should delete a specific note by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const note = E2EUtils.buildNote(user.id);

      const newNote = await notesFactory
        .withTitle(note.title)
        .withContent(note.content)
        .withUserId(note.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/notes/${newNote.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT);

      const deletedNote = await prisma.secureNote.findMany();
      expect(deletedNote).toHaveLength(0);
    });
  });
});
