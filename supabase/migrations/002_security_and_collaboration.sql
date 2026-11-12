-- Collaboration workflows, audit coverage, and write-rate safeguards.

create table if not exists public.content_rate_events (
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 action text not null,
 created_at timestamptz not null default now()
);
create index if not exists content_rate_user_idx on public.content_rate_events(user_id,action,created_at desc);
alter table public.content_rate_events enable row level security;
create policy content_rate_admin_read on public.content_rate_events for select using (public.is_admin());

create or replace function public.enforce_content_rate() returns trigger
language plpgsql security definer set search_path=public as $$
declare action_name text; window_start timestamptz; max_events integer; recent integer;
begin
 if auth.uid() is null or not public.is_approved() then raise exception 'Approved account required'; end if;
 if tg_table_name='idea_comments' then action_name:='comment';window_start:=now()-interval '1 minute';max_events:=20;
 elsif tg_table_name='ideas' then action_name:='idea';window_start:=now()-interval '1 hour';max_events:=5;
 elsif tg_table_name='problems' then action_name:='problem';window_start:=now()-interval '1 hour';max_events:=5;
 elsif tg_table_name='problem_solutions' then action_name:='solution';window_start:=now()-interval '1 hour';max_events:=10;
 elsif tg_table_name='solution_comments' then action_name:='solution_comment';window_start:=now()-interval '1 minute';max_events:=20;
 else return new; end if;
 select count(*) into recent from public.content_rate_events where user_id=auth.uid() and action=action_name and created_at>window_start;
 if recent>=max_events then raise exception 'Rate limit reached. Please slow down.'; end if;
 insert into public.content_rate_events(user_id,action) values(auth.uid(),action_name);
 return new;
end; $$;
create trigger rate_ideas before insert on public.ideas for each row execute function public.enforce_content_rate();
create trigger rate_comments before insert on public.idea_comments for each row execute function public.enforce_content_rate();
create trigger rate_problems before insert on public.problems for each row execute function public.enforce_content_rate();
create trigger rate_solutions before insert on public.problem_solutions for each row execute function public.enforce_content_rate();
create trigger rate_solution_comments before insert on public.solution_comments for each row execute function public.enforce_content_rate();

create or replace function public.review_project_join_request(p_request_id uuid,p_decision text) returns void
language plpgsql security definer set search_path=public as $$
declare req public.project_join_requests%rowtype; allowed boolean;
begin
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 select * into req from public.project_join_requests where id=p_request_id for update;
 if req.id is null or req.status<>'pending' then raise exception 'Pending request not found'; end if;
 select public.is_admin() or exists(select 1 from public.project_members where project_id=req.project_id and user_id=auth.uid() and is_leader and status='active') into allowed;
 if not allowed then raise exception 'Project leader access required'; end if;
 update public.project_join_requests set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now() where id=p_request_id;
 if p_decision='approved' then
  insert into public.project_members(project_id,user_id,project_role,status) values(req.project_id,req.user_id,'Contributor','active') on conflict(project_id,user_id) do update set status='active';
 end if;
 insert into public.notifications(user_id,actor_id,type,title,body,entity_type,entity_id,action_url)
 values(req.user_id,auth.uid(),'project_application_'||p_decision,'Project application '||p_decision,case when p_decision='approved' then 'You are now part of the project team.' else 'The project team did not accept this application.' end,'project',req.project_id,'/projects/'||req.project_id) on conflict do nothing;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_data) values(auth.uid(),'review_join_request','project_join_request',p_request_id,jsonb_build_object('decision',p_decision));
end; $$;
revoke execute on function public.review_project_join_request(uuid,text) from public,anon;
grant execute on function public.review_project_join_request(uuid,text) to authenticated;

create or replace function public.audit_admin_change() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is not null and public.is_staff() then
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,old_data,new_data)
  values(auth.uid(),lower(tg_op)||'_'||tg_table_name,tg_table_name,coalesce(new.id,old.id),case when tg_op='INSERT' then null else to_jsonb(old) end,case when tg_op='DELETE' then null else to_jsonb(new) end);
 end if;
 return coalesce(new,old);
end; $$;
create trigger audit_competitions after insert or update or delete on public.competitions for each row execute function public.audit_admin_change();
create trigger audit_projects after insert or update or delete on public.projects for each row execute function public.audit_admin_change();
create trigger audit_announcements after insert or update or delete on public.announcements for each row execute function public.audit_admin_change();
create trigger audit_reports after update on public.reports for each row execute function public.audit_admin_change();
create trigger audit_profile_privilege after update on public.profiles for each row when (old.role is distinct from new.role or old.approval_status is distinct from new.approval_status) execute function public.audit_admin_change();
