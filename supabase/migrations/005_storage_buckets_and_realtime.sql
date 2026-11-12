-- NXTGENCODERS dedicated Storage buckets and selective Realtime channels.
-- Existing buckets are never overwritten; ON CONFLICT preserves their configuration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp','image/avif']),
  ('idea-attachments', 'idea-attachments', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf','text/plain']),
  ('problem-attachments', 'problem-attachments', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf','text/plain']),
  ('project-assets', 'project-assets', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf','text/plain','application/zip'])
on conflict (id) do nothing;

-- Avatar object paths must be: <user-id>/<random-file-name>.
drop policy if exists nxt_avatars_public_read on storage.objects;
drop policy if exists nxt_avatars_owner_insert on storage.objects;
drop policy if exists nxt_avatars_owner_update on storage.objects;
drop policy if exists nxt_avatars_owner_delete on storage.objects;
create policy nxt_avatars_public_read on storage.objects for select using (bucket_id='avatars');
create policy nxt_avatars_owner_insert on storage.objects for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy nxt_avatars_owner_update on storage.objects for update to authenticated
using (bucket_id='avatars' and owner_id=auth.uid()::text)
with check (bucket_id='avatars' and owner_id=auth.uid()::text);
create policy nxt_avatars_owner_delete on storage.objects for delete to authenticated
using (bucket_id='avatars' and owner_id=auth.uid()::text);

-- Idea attachment paths must be: <idea-id>/<author-id>/<random-file-name>.
drop policy if exists nxt_idea_files_public_read on storage.objects;
drop policy if exists nxt_idea_files_author_insert on storage.objects;
drop policy if exists nxt_idea_files_author_update on storage.objects;
drop policy if exists nxt_idea_files_author_delete on storage.objects;
create policy nxt_idea_files_public_read on storage.objects for select using (bucket_id='idea-attachments');
create policy nxt_idea_files_author_insert on storage.objects for insert to authenticated
with check (
  bucket_id='idea-attachments'
  and (storage.foldername(name))[2]=auth.uid()::text
  and exists (
    select 1 from public.ideas i
    where i.id::text=(storage.foldername(name))[1] and i.author_id=auth.uid()
  )
);
create policy nxt_idea_files_author_update on storage.objects for update to authenticated
using (bucket_id='idea-attachments' and owner_id=auth.uid()::text)
with check (bucket_id='idea-attachments' and owner_id=auth.uid()::text);
create policy nxt_idea_files_author_delete on storage.objects for delete to authenticated
using (bucket_id='idea-attachments' and owner_id=auth.uid()::text);

-- Problem attachment paths must be: <problem-id>/<author-id>/<random-file-name>.
drop policy if exists nxt_problem_files_public_read on storage.objects;
drop policy if exists nxt_problem_files_author_insert on storage.objects;
drop policy if exists nxt_problem_files_author_update on storage.objects;
drop policy if exists nxt_problem_files_author_delete on storage.objects;
create policy nxt_problem_files_public_read on storage.objects for select using (bucket_id='problem-attachments');
create policy nxt_problem_files_author_insert on storage.objects for insert to authenticated
with check (
  bucket_id='problem-attachments'
  and (storage.foldername(name))[2]=auth.uid()::text
  and exists (
    select 1 from public.problems p
    where p.id::text=(storage.foldername(name))[1] and p.author_id=auth.uid()
  )
);
create policy nxt_problem_files_author_update on storage.objects for update to authenticated
using (bucket_id='problem-attachments' and owner_id=auth.uid()::text)
with check (bucket_id='problem-attachments' and owner_id=auth.uid()::text);
create policy nxt_problem_files_author_delete on storage.objects for delete to authenticated
using (bucket_id='problem-attachments' and owner_id=auth.uid()::text);

-- Project asset paths must be: <project-id>/<member-id>/<random-file-name>.
drop policy if exists nxt_project_assets_public_read on storage.objects;
drop policy if exists nxt_project_assets_member_insert on storage.objects;
drop policy if exists nxt_project_assets_owner_update on storage.objects;
drop policy if exists nxt_project_assets_owner_delete on storage.objects;
create policy nxt_project_assets_public_read on storage.objects for select using (bucket_id='project-assets');
create policy nxt_project_assets_member_insert on storage.objects for insert to authenticated
with check (
  bucket_id='project-assets'
  and (storage.foldername(name))[2]=auth.uid()::text
  and (
    public.is_admin()
    or exists (
      select 1 from public.project_members m
      where m.project_id::text=(storage.foldername(name))[1]
        and m.user_id=auth.uid() and m.status='active'
    )
  )
);
create policy nxt_project_assets_owner_update on storage.objects for update to authenticated
using (
  bucket_id='project-assets'
  and (owner_id=auth.uid()::text or public.is_admin())
)
with check (
  bucket_id='project-assets'
  and (owner_id=auth.uid()::text or public.is_admin())
);
create policy nxt_project_assets_owner_delete on storage.objects for delete to authenticated
using (bucket_id='project-assets' and (owner_id=auth.uid()::text or public.is_admin()));

alter table public.idea_votes replica identity full;
alter table public.competitions replica identity full;
alter table public.competition_finalists replica identity full;
alter table public.competition_results replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='idea_votes') then
    alter publication supabase_realtime add table public.idea_votes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='competitions') then
    alter publication supabase_realtime add table public.competitions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='competition_finalists') then
    alter publication supabase_realtime add table public.competition_finalists;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='competition_results') then
    alter publication supabase_realtime add table public.competition_results;
  end if;
end $$;
