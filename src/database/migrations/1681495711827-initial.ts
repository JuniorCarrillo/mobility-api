import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1681495711827 implements MigrationInterface {
  name = 'initial1681495711827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "role" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "card_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "brand" character varying NOT NULL, "last_four" character varying NOT NULL, "exp_year" character varying NOT NULL, "exp_month" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_98f9be14d5a240bf00f8b3f29bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "requests_a_ride" ("id" SERIAL NOT NULL, "location" double precision array NOT NULL, "destination" double precision array NOT NULL, "status" character varying NOT NULL DEFAULT 'REQUEST', "installments" integer NOT NULL DEFAULT '1', "finish_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "riderId" integer, "driverId" integer, "cardId" integer, CONSTRAINT "PK_1635af0b32c2a8397ce4a4a82f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gateway_payments" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "reference" character varying NOT NULL, "currency" character varying NOT NULL DEFAULT 'COP', "status" character varying NOT NULL, "method" character varying NOT NULL DEFAULT 'CARD', "price_in_cents" integer NOT NULL, "installments" integer NOT NULL DEFAULT '1', "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serviceId" integer, CONSTRAINT "PK_e0a82e164b552d48815e341024a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_tokens" ADD CONSTRAINT "FK_6facfbb8b1f7475ff8a9dbe20f2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" ADD CONSTRAINT "FK_ee3023f161f80248642e6062ef0" FOREIGN KEY ("riderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" ADD CONSTRAINT "FK_5d11a3fa2c8950ff9dd8c07da74" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" ADD CONSTRAINT "FK_f1d32ccffde02a4b10edeff208a" FOREIGN KEY ("cardId") REFERENCES "card_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gateway_payments" ADD CONSTRAINT "FK_1bc69692f0e0e0ad0a2097bb087" FOREIGN KEY ("serviceId") REFERENCES "requests_a_ride"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gateway_payments" DROP CONSTRAINT "FK_1bc69692f0e0e0ad0a2097bb087"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" DROP CONSTRAINT "FK_f1d32ccffde02a4b10edeff208a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" DROP CONSTRAINT "FK_5d11a3fa2c8950ff9dd8c07da74"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests_a_ride" DROP CONSTRAINT "FK_ee3023f161f80248642e6062ef0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "card_tokens" DROP CONSTRAINT "FK_6facfbb8b1f7475ff8a9dbe20f2"`,
    );
    await queryRunner.query(`DROP TABLE "gateway_payments"`);
    await queryRunner.query(`DROP TABLE "requests_a_ride"`);
    await queryRunner.query(`DROP TABLE "card_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
