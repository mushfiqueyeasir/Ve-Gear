-- Rename homepage section type hero → banner
alter table public.homepage_sections
  drop constraint if exists homepage_sections_type_check;

update public.homepage_sections
set type = 'banner'
where type = 'hero';

alter table public.homepage_sections
  add constraint homepage_sections_type_check
  check (type in ('banner','categories','featured','reviews','promo','richtext'));
