-- Add family_size and weekly_budget to households table
alter table households add column if not exists family_size int not null default 4;
alter table households add column if not exists weekly_budget numeric not null default 300;
