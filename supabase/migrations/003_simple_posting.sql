-- Simplify public posting to a heading plus one body field.
-- Existing rich posts remain readable; new posts no longer require metadata.

alter table public.ideas
  drop constraint if exists ideas_title_check,
  drop constraint if exists ideas_short_description_check,
  drop constraint if exists ideas_detailed_explanation_check,
  drop constraint if exists ideas_problem_statement_check,
  drop constraint if exists ideas_proposed_solution_check,
  drop constraint if exists ideas_technology_stack_check;

alter table public.ideas
  alter column problem_statement drop not null,
  alter column proposed_solution drop not null,
  alter column technology_stack set default '{}',
  alter column category set default 'Other',
  alter column difficulty set default 'Beginner';

alter table public.ideas
  add constraint ideas_title_check check (char_length(title) between 3 and 120),
  add constraint ideas_short_description_check check (char_length(short_description) between 10 and 280),
  add constraint ideas_detailed_explanation_check check (char_length(detailed_explanation) between 10 and 10000),
  add constraint ideas_problem_statement_check check (problem_statement is null or char_length(problem_statement) between 10 and 3000),
  add constraint ideas_proposed_solution_check check (proposed_solution is null or char_length(proposed_solution) between 10 and 5000),
  add constraint ideas_technology_stack_check check (cardinality(technology_stack) <= 12);

alter table public.problems
  drop constraint if exists problems_title_check,
  drop constraint if exists problems_description_check,
  drop constraint if exists problems_affected_people_check,
  drop constraint if exists problems_importance_check;

alter table public.problems
  alter column affected_people drop not null,
  alter column importance drop not null,
  alter column category set default 'Other';

alter table public.problems
  add constraint problems_title_check check (char_length(title) between 3 and 140),
  add constraint problems_description_check check (char_length(description) between 10 and 10000),
  add constraint problems_affected_people_check check (affected_people is null or char_length(affected_people) between 10 and 2000),
  add constraint problems_importance_check check (importance is null or char_length(importance) between 10 and 3000);
