-- Remove PL/pgSQL warnings and validate all RPC input explicitly.

create or replace function public.cast_comment_vote(p_comment_id uuid) returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  comment_owner uuid;
begin
  if not public.is_approved() then raise exception 'Approved account required'; end if;
  select author_id into comment_owner from public.idea_comments where id=p_comment_id;
  if comment_owner is null then raise exception 'Comment not found'; end if;
  if comment_owner=auth.uid() then raise exception 'You cannot vote on your own comment'; end if;

  if exists(select 1 from public.comment_votes where comment_id=p_comment_id and user_id=auth.uid()) then
    delete from public.comment_votes where comment_id=p_comment_id and user_id=auth.uid();
  else
    insert into public.comment_votes(comment_id,user_id) values(p_comment_id,auth.uid());
  end if;
end;
$$;

create or replace function public.cast_solution_vote(p_solution_id uuid,p_value smallint default 1) returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  solution_owner uuid;
begin
  if not public.is_approved() then raise exception 'Approved account required'; end if;
  if p_value<>1 then raise exception 'Solution votes only support value 1'; end if;
  select author_id into solution_owner from public.problem_solutions where id=p_solution_id;
  if solution_owner is null then raise exception 'Solution not found'; end if;
  if solution_owner=auth.uid() then raise exception 'You cannot vote on your own solution'; end if;

  if exists(select 1 from public.solution_votes where solution_id=p_solution_id and user_id=auth.uid()) then
    delete from public.solution_votes where solution_id=p_solution_id and user_id=auth.uid();
  else
    insert into public.solution_votes(solution_id,user_id,value) values(p_solution_id,auth.uid(),p_value);
  end if;
end;
$$;

grant execute on function public.cast_comment_vote(uuid) to authenticated;
grant execute on function public.cast_solution_vote(uuid,smallint) to authenticated;
