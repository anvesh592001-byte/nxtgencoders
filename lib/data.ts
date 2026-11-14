import { createClient, getServerUser } from "@/lib/supabase/server";

export type Idea = {
 id:string; title:string; short_description:string; detailed_explanation?:string; category:string; difficulty:string; technology_stack:string[]; status:string;
 created_at:string; author_id:string; author_name:string; author_username:string; avatar_url:string|null; vote_score:number; comment_count:number; like_count:number; viewer_liked?:boolean; viewer_id?:string|null; viewer_role?:string|null; can_manage?:boolean; rank?:number|null; competition_id?:string|null;
};
export type Problem = {id:string;title:string;description:string;category:string;status:string;created_at:string;author_id:string;author_name:string;author_username:string;avatar_url:string|null;solution_count:number;volunteer_count:number;comment_count:number};
export type Project = {id:string;title:string;slug:string;description:string;image_url:string|null;status:string;progress:number;technology_stack:string[];github_url:string|null;demo_url:string|null;leader_name:string;member_count:number;created_at:string};

export async function getViewer(){const s=await createClient();if(!s)return null;return getServerUser();}
export async function getStats(){
 const s=await createClient();if(!s)return {students:0,ideas:0,problems:0,projects:0,contributors:0};
 const {data:aggregate,error}=await s.rpc("get_community_stats");
 const row=Array.isArray(aggregate)?aggregate[0]:aggregate;
 if(!error&&row)return {students:Number(row.students||0),ideas:Number(row.ideas||0),problems:Number(row.problems||0),projects:Number(row.projects||0),contributors:Number(row.contributors||0)};
 // Compatibility fallback while migration 009 is being rolled out.
 const [students,ideas,problems,projects,contributors]=await Promise.all([
  s.from("profiles").select("id",{count:"exact",head:true}).eq("approval_status","approved"),s.from("ideas").select("id",{count:"exact",head:true}),
  s.from("problems").select("id",{count:"exact",head:true}),s.from("projects").select("id",{count:"exact",head:true}),
  s.from("profiles").select("id",{count:"exact",head:true}).gt("contribution_points",0)
 ]);return {students:students.count||0,ideas:ideas.count||0,problems:problems.count||0,projects:projects.count||0,contributors:contributors.count||0};
}
export async function getIdeas(opts:{limit?:number;q?:string;category?:string;difficulty?:string;sort?:string;competition?:string}={}){
 const s=await createClient();if(!s)return [] as Idea[];let q=s.from("idea_feed").select("*");
 if(opts.q)q=q.or(`title.ilike.%${opts.q}%,short_description.ilike.%${opts.q}%`);if(opts.category&&opts.category!=="All")q=q.eq("category",opts.category);if(opts.difficulty&&opts.difficulty!=="All")q=q.eq("difficulty",opts.difficulty);if(opts.competition)q=q.eq("competition_id",opts.competition);
 if(opts.sort==="newest")q=q.order("created_at",{ascending:false});else if(opts.sort==="discussed")q=q.order("comment_count",{ascending:false});else q=q.order("vote_score",{ascending:false}).order("created_at",{ascending:false});
 const {data,error}=await q.limit(opts.limit||30);if(error){console.error(error.message);return [];}
 const ideas=(data||[]) as Idea[];
 const {data:{user}}=await s.auth.getUser();
 if(!user)return ideas.map(idea=>({...idea,like_count:Number(idea.like_count||0),viewer_liked:false,viewer_id:null,viewer_role:null,can_manage:false}));
 const ids=ideas.map(idea=>idea.id);
 const [likes,profile]=await Promise.all([
  ids.length?s.from("idea_likes").select("idea_id").eq("user_id",user.id).in("idea_id",ids):Promise.resolve({data:[] as any[]}),
  s.from("profiles").select("role").eq("id",user.id).maybeSingle()
 ]);
 const liked=new Set((likes.data||[]).map((row:any)=>row.idea_id));
 const role=profile.data?.role||null;
 return ideas.map(idea=>({...idea,like_count:Number(idea.like_count||0),viewer_liked:liked.has(idea.id),viewer_id:user.id,viewer_role:role,can_manage:idea.author_id===user.id||role==="admin"||role==="chief"||role==="moderator"}));
}
export async function getIdea(id:string){const s=await createClient();if(!s)return null;const {data}=await s.from("idea_feed").select("*").eq("id",id).maybeSingle();if(!data)return null;const {data:{user}}=await s.auth.getUser();const [full,comments,vote,bookmark,like,profile]=await Promise.all([
 s.from("ideas").select("*").eq("id",id).single(),s.from("idea_comments").select("*,author:profiles!idea_comments_author_id_fkey(display_name,username,avatar_url),votes:comment_votes(user_id,value)").eq("idea_id",id).order("created_at"),
 s.from("idea_votes").select("value").eq("idea_id",id).maybeSingle(),s.from("bookmarks").select("idea_id").eq("idea_id",id).maybeSingle(),
 user?s.from("idea_likes").select("idea_id").eq("idea_id",id).eq("user_id",user.id).maybeSingle():Promise.resolve({data:null} as any),
 user?s.from("profiles").select("role").eq("id",user.id).maybeSingle():Promise.resolve({data:null} as any)
 ]);let attachment_url=null;if(full.data?.attachment_path){const {data:signed}=await s.storage.from("attachments").createSignedUrl(full.data.attachment_path,3600);attachment_url=signed?.signedUrl||null;}const role=profile.data?.role||null;return {...data,...full.data,like_count:Number(data.like_count||0),comments:comments.data||[],viewerVote:vote.data?.value||0,viewerLiked:Boolean(like.data),bookmarked:Boolean(bookmark.data),attachment_url,viewerId:user?.id||null,viewerRole:role,canManage:Boolean(user&&(data.author_id===user.id||role==="admin"||role==="chief"||role==="moderator"))};}
export async function getProblems(limit=30){const s=await createClient();if(!s)return [] as Problem[];const {data}=await s.from("problem_feed").select("*").order("created_at",{ascending:false}).limit(limit);return (data||[]) as Problem[];}
export async function getProblem(id:string){
 const s=await createClient();if(!s)return null;
 const [problem,solutions,volunteers,comments]=await Promise.all([
  s.from("problem_feed").select("*").eq("id",id).maybeSingle(),
  s.from("problem_solutions").select("*,author:profiles!problem_solutions_author_id_fkey(display_name,username,avatar_url),votes:solution_votes(value),comments:solution_comments(*,author:profiles!solution_comments_author_id_fkey(display_name,username,avatar_url))").eq("problem_id",id).order("created_at"),
  s.from("problem_volunteers").select("*,profile:profiles!problem_volunteers_user_id_fkey(display_name,username,avatar_url,skills)").eq("problem_id",id),
  s.from("problem_comments").select("*,author:profiles!problem_comments_author_id_fkey(display_name,username,avatar_url),likes:problem_comment_likes(user_id)").eq("problem_id",id).order("created_at")
 ]);
 if(!problem.data)return null;
 const {data:full}=await s.from("problems").select("*").eq("id",id).single();
 const {data:{user}}=await s.auth.getUser();let role=null;if(user){const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();role=p?.role;}
 return {...problem.data,...full,solutions:solutions.data||[],volunteers:volunteers.data||[],comments:comments.data||[],viewerId:user?.id||null,canAccept:Boolean(user&&(user.id===problem.data.author_id||role==="admin"||role==="chief"||role==="moderator")),canDelete:Boolean(user&&(user.id===problem.data.author_id||role==="admin"||role==="chief"))};
}
export async function getProjects(limit=30){const s=await createClient();if(!s)return [] as Project[];const {data}=await s.from("project_feed").select("*").order("created_at",{ascending:false}).limit(limit);return (data||[]) as Project[];}
export async function getProject(id:string){
 const s=await createClient();if(!s)return null;
 const isUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
 const {data:project}=await (isUuid?s.from("project_feed").select("*").eq("id",id):s.from("project_feed").select("*").eq("slug",id)).maybeSingle();if(!project)return null;
 const pid=project.id;
 const user=await getServerUser();
 const [members,tasks,updates,milestones,requests]=await Promise.all([
  s.from("project_members").select("*,profile:profiles!project_members_user_id_fkey(display_name,username,avatar_url,skills)").eq("project_id",pid),
  s.from("project_tasks").select("*").eq("project_id",pid).order("created_at"),
  s.from("project_updates").select("*,author:profiles!project_updates_author_id_fkey(display_name,username,avatar_url)").eq("project_id",pid).order("created_at",{ascending:false}),
  s.from("project_milestones").select("*").eq("project_id",pid).order("due_date"),
  s.from("project_join_requests").select("*,profile:profiles!project_join_requests_user_id_fkey(display_name,username,avatar_url,skills)").eq("project_id",pid).eq("status","pending")
 ]);
 const viewerMember=(members.data||[]).find((m:any)=>m.user_id===user?.id&&m.status==="active");
 return {...project,members:members.data||[],tasks:tasks.data||[],updates:updates.data||[],milestones:milestones.data||[],requests:requests.data||[],viewerId:user?.id||null,isMember:Boolean(viewerMember),canManage:Boolean(viewerMember?.is_leader)};
}
export async function getCurrentCompetition(){const s=await createClient();if(!s)return null;const {data}=await s.from("competitions").select("*").in("status",["submission_open","voting_open","finalist_review"]).order("starts_at",{ascending:false}).limit(1).maybeSingle();return data;}
export async function getCompetitions(){const s=await createClient();if(!s)return [];const {data}=await s.from("competitions").select("*,result:competition_results(*,idea:ideas(title))").order("starts_at",{ascending:false});return data||[];}
export async function getCompetition(id:string){const s=await createClient();if(!s)return null;const {data}=await s.from("competitions").select("*").eq("id",id).maybeSingle();if(!data)return null;const ideas=await getIdeas({competition:id,limit:50});const {data:finalists}=await s.from("competition_finalists").select("*,idea:ideas(*,author:profiles!ideas_author_id_fkey(display_name,username,avatar_url))").eq("competition_id",id).order("rank");const {data:result}=await s.from("competition_results").select("*,idea:ideas(*,author:profiles!ideas_author_id_fkey(display_name,username,avatar_url))").eq("competition_id",id).maybeSingle();return {...data,ideas,finalists:finalists||[],result};}
export async function getLeaderboard(period="all"){const s=await createClient();if(!s)return [];const {data}=await s.rpc("get_leaderboard",{p_period:period});return data||[];}
export async function getNotifications(){const s=await createClient();if(!s)return [];const {data}=await s.from("notifications").select("*").order("created_at",{ascending:false}).limit(50);return data||[];}
export async function getProfile(username:string){const s=await createClient();if(!s)return null;let q=s.from("profiles").select("*");if(username==="me"){const {data:{user}}=await s.auth.getUser();if(!user)return null;q=q.eq("id",user.id);}else q=q.eq("username",username);const {data}=await q.maybeSingle();if(!data)return null;const [ideas,solutions,memberships,badges,stats,comments]=await Promise.all([s.from("idea_feed").select("*").eq("author_id",data.id).order("created_at",{ascending:false}),s.from("problem_solutions").select("*,problem:problems(title)").eq("author_id",data.id),s.from("project_members").select("*,project:projects(id,title,slug,status)").eq("user_id",data.id),s.from("user_achievements").select("*,achievement:achievements(*)").eq("user_id",data.id),s.from("profile_contribution_stats").select("*").eq("id",data.id).maybeSingle(),s.from("idea_comments").select("*,idea:ideas(id,title)").eq("author_id",data.id).order("created_at",{ascending:false}).limit(20)]);return {...data,ideas:ideas.data||[],solutions:solutions.data||[],memberships:memberships.data||[],badges:badges.data||[],stats:stats.data||null,comments:comments.data||[]};}
export async function getHomeData(){const [stats,ideas,problems,competition,projects]=await Promise.all([getStats(),getIdeas({limit:5}),getProblems(4),getCurrentCompetition(),getProjects(3)]);const top3=competition?await getIdeas({competition:competition.id,limit:3}):[];return {stats,ideas,problems,competition,top3,projects};}
export async function globalSearch(q:string){const s=await createClient();if(!s||!q)return {ideas:[],problems:[],projects:[],profiles:[]};const term=`%${q}%`;const [ideas,problems,projects,profiles]=await Promise.all([s.from("idea_feed").select("*").or(`title.ilike.${term},short_description.ilike.${term}`).limit(10),s.from("problem_feed").select("*").or(`title.ilike.${term},description.ilike.${term}`).limit(10),s.from("project_feed").select("*").or(`title.ilike.${term},description.ilike.${term}`).limit(10),s.from("profiles").select("id,display_name,username,avatar_url,bio,skills").or(`display_name.ilike.${term},username.ilike.${term}`).limit(10)]);const rows=(ideas.data||[]) as Idea[];const user=await getServerUser();if(!user)return {ideas:rows.map(idea=>({...idea,like_count:Number(idea.like_count||0),viewer_liked:false,viewer_id:null,viewer_role:null,can_manage:false})),problems:problems.data||[],projects:projects.data||[],profiles:profiles.data||[]};const ids=rows.map(idea=>idea.id);const [likes,profile]=await Promise.all([ids.length?s.from("idea_likes").select("idea_id").eq("user_id",user.id).in("idea_id",ids):Promise.resolve({data:[] as any[]}),s.from("profiles").select("role").eq("id",user.id).maybeSingle()]);const liked=new Set((likes.data||[]).map((row:any)=>row.idea_id));const role=profile.data?.role||null;return {ideas:rows.map(idea=>({...idea,like_count:Number(idea.like_count||0),viewer_liked:liked.has(idea.id),viewer_id:user.id,viewer_role:role,can_manage:idea.author_id===user.id||role==="admin"||role==="chief"||role==="moderator"})),problems:problems.data||[],projects:projects.data||[],profiles:profiles.data||[]};}
