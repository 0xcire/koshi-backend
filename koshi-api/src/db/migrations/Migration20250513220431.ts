import { Migration } from '@mikro-orm/migrations';

export class Migration20250513220431 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "users" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "email_verified" boolean not null, "image" varchar(255) null, "username" varchar(255) null, "display_username" varchar(255) null, "role" varchar(255) null, "banned" boolean null, "ban_reason" varchar(255) null, "ban_expires" timestamptz null, constraint "users_pkey" primary key ("id"));`,
    );
    this.addSql(
      `comment on column "users"."id" is 'Primary key for the user';`,
    );
    this.addSql(
      `comment on column "users"."created_at" is 'Timestamp of when the record was created';`,
    );
    this.addSql(
      `comment on column "users"."updated_at" is 'comment: ''Timestamp of the last user record update'',';`,
    );
    this.addSql(`comment on column "users"."name" is 'User''s full name';`);
    this.addSql(`comment on column "users"."email" is 'Unique email address';`);
    this.addSql(
      `comment on column "users"."email_verified" is 'Whether the email is verified';`,
    );
    this.addSql(
      `comment on column "users"."image" is 'User''s profile image URL';`,
    );
    this.addSql(
      `comment on column "users"."username" is 'Unique user identifier for display or login';`,
    );
    this.addSql(
      `comment on column "users"."display_username" is 'Publicly visible username';`,
    );
    this.addSql(
      `comment on column "users"."role" is 'User''s role or permission level (e.g., admin, user)';`,
    );
    this.addSql(
      `comment on column "users"."banned" is 'Whether the user is banned from the system';`,
    );
    this.addSql(
      `comment on column "users"."ban_reason" is 'Reason for the user''s ban';`,
    );
    this.addSql(
      `comment on column "users"."ban_expires" is 'Date when the user''s ban expires';`,
    );
    this.addSql(`create index "users_email_index" on "users" ("email");`);
    this.addSql(
      `alter table "users" add constraint "users_email_unique" unique ("email");`,
    );
    this.addSql(
      `alter table "users" add constraint "users_username_unique" unique ("username");`,
    );

    this.addSql(
      `create table "accounts" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "account_id" varchar(255) not null, "provider_id" varchar(255) not null, "userId" varchar(255) not null, "access_token" varchar(255) null, "refresh_token" varchar(255) null, "id_token" varchar(255) null, "access_token_expires_at" timestamptz null, "refresh_token_expires_at" timestamptz null, "scope" varchar(255) null, "password" varchar(255) null, constraint "accounts_pkey" primary key ("id"));`,
    );
    this.addSql(
      `comment on column "accounts"."id" is 'Primary key for the account';`,
    );
    this.addSql(
      `comment on column "accounts"."created_at" is 'Timestamp of when the record was created';`,
    );
    this.addSql(
      `comment on column "accounts"."updated_at" is 'comment: ''Timestamp of the last user record update'',';`,
    );
    this.addSql(
      `comment on column "accounts"."account_id" is 'Provider-specific account ID';`,
    );
    this.addSql(
      `comment on column "accounts"."provider_id" is 'Identifier for the provider (e.g., Google, GitHub)';`,
    );
    this.addSql(
      `comment on column "accounts"."userId" is 'Foreign key to user.id';`,
    );
    this.addSql(
      `comment on column "accounts"."access_token" is 'OAuth access token';`,
    );
    this.addSql(
      `comment on column "accounts"."refresh_token" is 'OAuth refresh token';`,
    );
    this.addSql(
      `comment on column "accounts"."id_token" is 'OAuth ID token for identity verification';`,
    );
    this.addSql(
      `comment on column "accounts"."access_token_expires_at" is 'Expiration timestamp for the access token';`,
    );
    this.addSql(
      `comment on column "accounts"."refresh_token_expires_at" is 'Expiration timestamp for the refresh token';`,
    );
    this.addSql(
      `comment on column "accounts"."scope" is 'OAuth scopes granted to the account';`,
    );
    this.addSql(
      `comment on column "accounts"."password" is 'Hashed password for password-based accounts';`,
    );
    this.addSql(
      `create index "accounts_userId_index" on "accounts" ("userId");`,
    );

    this.addSql(
      `create table "verifications" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "identifier" varchar(255) not null, "value" varchar(255) not null, "expires_at" timestamptz not null, constraint "verifications_pkey" primary key ("id"));`,
    );
    this.addSql(
      `comment on column "verifications"."id" is 'Primary key for the verification record';`,
    );
    this.addSql(
      `comment on column "verifications"."created_at" is 'Timestamp of when the record was created';`,
    );
    this.addSql(
      `comment on column "verifications"."updated_at" is 'comment: ''Timestamp of the last user record update'',';`,
    );
    this.addSql(
      `comment on column "verifications"."identifier" is 'Identifier for the verification (e.g., email or user ID)';`,
    );
    this.addSql(
      `comment on column "verifications"."value" is 'Verification token or code';`,
    );
    this.addSql(
      `comment on column "verifications"."expires_at" is 'Expiration timestamp for the verification token';`,
    );

    this.addSql(
      `alter table "accounts" add constraint "accounts_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "accounts" drop constraint "accounts_userId_foreign";`,
    );

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "accounts" cascade;`);

    this.addSql(`drop table if exists "verifications" cascade;`);
  }
}
