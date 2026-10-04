const KEY='employeeProjectManager_v1';
let data=JSON.parse(localStorage.getItem(KEY))||{users:[],currentUser:null,employees:[],projects:[],tasks:[]};
let editId=null;

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function toast(msg){let t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function showRegister(){loginForm.classList.add('hidden');registerForm.classList.remove('hidden');authSubtitle.textContent='Create your account'}
function showLogin(){registerForm.classList.add('hidden');loginForm.classList.remove('hidden');authSubtitle.textContent='Sign in to your account'}

loginForm.onsubmit=e=>{e.preventDefault();let u=data.users.find(x=>x.email===loginEmail.value.trim().toLowerCase()&&x.password===loginPassword.value);if(!u)return toast('Invalid email or password');data.currentUser=u.id;save();startApp()}
registerForm.onsubmit=e=>{e.preventDefault();let email=regEmail.value.trim().toLowerCase();if(data.users.some(x=>x.email===email))return toast('Email already registered');let u={id:id(),name:regName.value.trim(),email,password:regPassword.value};data.users.push(u);data.currentUser=u.id;save();startApp();toast('Account created')}
function startApp(){authView.classList.add('hidden');appView.classList.remove('hidden');let u=currentUser();userName.textContent=u.name;renderAll()}
function currentUser(){return data.users.find(x=>x.id===data.currentUser)}
function logout(){data.currentUser=null;save();location.reload()}
function toggleSidebar(){sidebar.classList.toggle('open')}
function showPage(page,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(page).classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active');pageTitle.textContent=page[0].toUpperCase()+page.slice(1);sidebar.classList.remove('open');if(page==='profile'){profileName.value=currentUser().name;profileEmail.value=currentUser().email}}
function renderAll(){renderEmployees();renderProjects();renderTasks();renderDashboard()}
function renderDashboard(){
statEmployees.textContent=data.employees.length;statProjects.textContent=data.projects.length;statTasks.textContent=data.tasks.length;statCompleted.textContent=data.tasks.filter(x=>x.status==='Completed').length;
recentProjects.innerHTML=data.projects.slice(-5).reverse().map(p=>`<div style="margin-bottom:15px"><b>${esc(p.name)}</b><div style="font-size:13px;color:#6b7280;margin:5px 0">${esc(p.status)} • ${esc(p.deadline||'No deadline')}</div><div class="progress"><div style="width:${p.progress}%"></div></div></div>`).join('')||'<div class="empty">No projects yet.</div>';
recentTasks.innerHTML=data.tasks.slice(-5).reverse().map(t=>`<div style="padding:10px 0;border-bottom:1px solid #eee"><b>${esc(t.name)}</b><div style="font-size:13px;color:#6b7280">${esc(t.status)} • ${esc(t.priority)}</div></div>`).join('')||'<div class="empty">No tasks yet.</div>';
}
function renderEmployees(){employeeTable.innerHTML=data.employees.map(e=>`<tr><td><b>${esc(e.name)}</b></td><td>${esc(e.email)}</td><td>${esc(e.position)}</td><td><span class="badge ${e.status==='Active'?'completed':'pending'}">${e.status}</span></td><td class="actions"><button class="btn-secondary" onclick="openEmployeeModal('${e.id}')">Edit</button><button class="btn-danger" onclick="removeItem('employees','${e.id}')">Delete</button></td></tr>`).join('')||emptyRow(5)}
function renderProjects(){projectTable.innerHTML=data.projects.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.manager)}</td><td>${esc(p.deadline||'-')}</td><td style="min-width:130px"><div class="progress"><div style="width:${p.progress}%"></div></div><small>${p.progress}%</small></td><td><span class="badge ${p.status.toLowerCase()}">${p.status}</span></td><td class="actions"><button class="btn-secondary" onclick="openProjectModal('${p.id}')">Edit</button><button class="btn-danger" onclick="removeItem('projects','${p.id}')">Delete</button></td></tr>`).join('')||emptyRow(6)}
function renderTasks(){taskTable.innerHTML=data.tasks.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.project||'-')}</td><td>${esc(t.assignee||'-')}</td><td>${esc(t.priority)}</td><td><span class="badge ${t.status==='Completed'?'completed':t.status==='Ongoing'?'ongoing':'pending'}">${t.status}</span></td><td class="actions"><button class="btn-secondary" onclick="openTaskModal('${t.id}')">Edit</button><button class="btn-danger" onclick="removeItem('tasks','${t.id}')">Delete</button></td></tr>`).join('')||emptyRow(6)}
function emptyRow(n){return `<tr><td colspan="${n}" class="empty">No records yet.</td></tr>`}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

function openModal(title,body){modalTitle.textContent=title;modalBody.innerHTML=body;modal.classList.add('show')}
function closeModal(){modal.classList.remove('show');editId=null}
function openEmployeeModal(eid){
let e=data.employees.find(x=>x.id===eid)||{};editId=eid||null;
openModal(eid?'Edit Employee':'Add Employee',`<form onsubmit="saveEmployee(event)">
<div class="form-group"><label>Name</label><input id="fName" value="${esc(e.name)}" required></div>
<div class="form-group"><label>Email</label><input id="fEmail" type="email" value="${esc(e.email)}" required></div>
<div class="form-group"><label>Position</label><input id="fPosition" value="${esc(e.position)}" required></div>
<div class="form-group"><label>Status</label><select id="fStatus"><option ${e.status==='Active'?'selected':''}>Active</option><option ${e.status==='Inactive'?'selected':''}>Inactive</option></select></div>
<button class="btn btn-primary">Save Employee</button></form>`)
}
function saveEmployee(ev){ev.preventDefault();let obj={id:editId||id(),name:fName.value,email:fEmail.value,position:fPosition.value,status:fStatus.value};let i=data.employees.findIndex(x=>x.id===obj.id);if(i>=0)data.employees[i]=obj;else data.employees.push(obj);save();closeModal();renderAll();toast('Employee saved')}
function openProjectModal(pid){
let p=data.projects.find(x=>x.id===pid)||{};editId=pid||null;
openModal(pid?'Edit Project':'Add Project',`<form onsubmit="saveProject(event)">
<div class="form-group"><label>Project Name</label><input id="pName" value="${esc(p.name)}" required></div>
<div class="form-group"><label>Manager</label><input id="pManager" value="${esc(p.manager)}" required></div>
<div class="form-group"><label>Deadline</label><input id="pDeadline" type="date" value="${esc(p.deadline)}"></div>
<div class="form-group"><label>Progress (%)</label><input id="pProgress" type="number" min="0" max="100" value="${p.progress??0}"></div>
<div class="form-group"><label>Status</label><select id="pStatus"><option ${p.status==='Pending'?'selected':''}>Pending</option><option ${p.status==='Ongoing'?'selected':''}>Ongoing</option><option ${p.status==='Completed'?'selected':''}>Completed</option></select></div>
<button class="btn btn-primary">Save Project</button></form>`)
}
function saveProject(ev){ev.preventDefault();let obj={id:editId||id(),name:pName.value,manager:pManager.value,deadline:pDeadline.value,progress:Math.max(0,Math.min(100,Number(pProgress.value)||0)),status:pStatus.value};let i=data.projects.findIndex(x=>x.id===obj.id);if(i>=0)data.projects[i]=obj;else data.projects.push(obj);save();closeModal();renderAll();toast('Project saved')}
function openTaskModal(tid){
let t=data.tasks.find(x=>x.id===tid)||{};editId=tid||null;
let projects=data.projects.map(p=>`<option ${t.project===p.name?'selected':''}>${esc(p.name)}</option>`).join('');
let employees=data.employees.map(e=>`<option ${t.assignee===e.name?'selected':''}>${esc(e.name)}</option>`).join('');
openModal(tid?'Edit Task':'Add Task',`<form onsubmit="saveTask(event)">
<div class="form-group"><label>Task Name</label><input id="tName" value="${esc(t.name)}" required></div>
<div class="form-group"><label>Project</label><select id="tProject"><option value="">None</option>${projects}</select></div>
<div class="form-group"><label>Assigned To</label><select id="tAssignee"><option value="">Unassigned</option>${employees}</select></div>
<div class="form-group"><label>Priority</label><select id="tPriority"><option ${t.priority==='Low'?'selected':''}>Low</option><option ${t.priority==='Medium'||!t.priority?'selected':''}>Medium</option><option ${t.priority==='High'?'selected':''}>High</option></select></div>
<div class="form-group"><label>Status</label><select id="tStatus"><option ${t.status==='Pending'||!t.status?'selected':''}>Pending</option><option ${t.status==='Ongoing'?'selected':''}>Ongoing</option><option ${t.status==='Completed'?'selected':''}>Completed</option></select></div>
<button class="btn btn-primary">Save Task</button></form>`)
}
function saveTask(ev){ev.preventDefault();let obj={id:editId||id(),name:tName.value,project:tProject.value,assignee:tAssignee.value,priority:tPriority.value,status:tStatus.value};let i=data.tasks.findIndex(x=>x.id===obj.id);if(i>=0)data.tasks[i]=obj;else data.tasks.push(obj);save();closeModal();renderAll();toast('Task saved')}
function removeItem(type,itemId){if(!confirm('Delete this item?'))return;data[type]=data[type].filter(x=>x.id!==itemId);save();renderAll();toast('Deleted')}
function saveProfile(){let u=currentUser();u.name=profileName.value.trim()||u.name;save();userName.textContent=u.name;toast('Profile updated')}

window.onclick=e=>{if(e.target===modal)closeModal()}
if(data.currentUser&&currentUser())startApp();
