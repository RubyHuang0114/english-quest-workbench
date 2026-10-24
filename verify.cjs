// 使用独立内存档案验证判题与间隔修复，不修改用户浏览器记录。
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let now=1792630800000;
class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const nodes=new Map();const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',value:'',style:{},classList:{toggle(){}},scrollIntoView(){},blur(){},click(){},append(){},remove(){},files:[]});return nodes.get(s)};
const ctx={console,Date:Clock,setTimeout:()=>1,clearTimeout(){},Blob,URL,SpeechSynthesisUtterance:function(){},document:{documentElement:{dataset:{}},querySelector:node,querySelectorAll:()=>[],addEventListener(){},body:{append(){}},createElement:()=>node('a')},localStorage:{getItem:()=>null,setItem(){}},window:{scrollTo(){}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);vm.runInContext(fs.readFileSync(__dirname+'/audio.js','utf8'),ctx);
for(const f of ['modules/catalog.js','content.js','dialogues.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
let code=fs.readFileSync(__dirname+'/app.js','utf8').replace('// 只暴露只读内容计数',`window.__test={start,submit,action,metric,buildQueue,validState,norm,get state(){return state},get session(){return session},choose(a,e,r,h=false){sel=a;evidence=e;relation=r;hintUsed=h},reset(){state={version:1,history:[],mistakes:{},xp:0,theme:'robot',sound:false,streak:0}}};\n// 只暴露只读内容计数`);
vm.runInContext(fs.readFileSync(__dirname+'/rewards.js','utf8'),ctx);vm.runInContext(code,ctx);const t=ctx.window.__test,D=ctx.window.REVIEW_DATA,Q=D.questions;let checks=0;
const check=(condition,message)=>{assert(condition,message);checks++};
check(Q.length>=650,'题库完整');check(D.verbs.length===102,'原表102项全部保留');check(new Set(Q.map(q=>q.id)).size===Q.length,'题目ID唯一');
const dist=[0,0,0,0];
for(const q of Q){check(q.explain&&q.source&&q.prompt,'每题有题干解析出处');if(q.options){check(q.answer>=0&&q.answer<q.options.length,'选择索引有效');check(new Set(q.options).size===q.options.length,'无重复选项');if(q.options.length===4)dist[q.answer]++}else check(q.answer.length>0&&q.answer.every(a=>a&&a!=='/'),'文本答案有效');if(['reading','dialogue'].includes(q.type))check(q.sentences[q.evidence]&&q.relations[q.relation],'阅读证据索引有效')}
check(dist.every(n=>n>15),'正确选项位置分散');
function answer(q,input,hint=false,reason=true){now+=1000;t.start(q.skill,1,'all','all',[q]);node('#answer').value=input??(q.options?'':q.answer[0]);t.choose(q.options?(input??q.answer):null,reason?q.evidence:0,reason?q.relation:(q.relation+1)%3,hint);t.submit()}
t.reset();
for(const q of Q){answer(q);check(t.state.history.at(-1).correct,'标准答案应被接受：'+q.id)}
check(t.state.history.length===Q.length,'每次作答只保存一次');
const v=Q.find(q=>q.skill==='verbs'&&!q.options);t.reset();answer(v,'clearly-wrong');check(t.state.mistakes[v.id].count===1,'答错自动归档');answer(v,undefined,true);check(t.state.mistakes[v.id].successes===0,'有提示不修复');answer(v);check(t.state.mistakes[v.id].successes===1&&!t.state.mistakes[v.id].resolved,'首次独立通过仅进入间隔复查');answer(v);check(!t.state.mistakes[v.id].resolved,'未到期不能提前修复');now+=86400001;answer(v);check(t.state.mistakes[v.id].resolved,'到期第二次独立正确后修复');
const r=Q.find(q=>q.type==='reading');t.reset();answer(r,undefined,false,false);check(t.state.history[0].correct&&!t.state.history[0].reasonCorrect,'答案与思路分别记录');check(t.state.mistakes[r.id]&&!t.state.mistakes[r.id].resolved,'阅读证据有误也归档');
t.reset();for(const q of Q.filter(q=>q.skill==='grammar').slice(0,5))answer(q);check(t.metric('grammar').ready,'不同题且独立次数足够可用于评估');check(t.metric('grammar').score===100,'评估正确率正确');
t.reset();for(let i=0;i<6;i++)answer(v);check(!t.metric('verbs').ready,'反复刷同一题不能建立能力基线');
t.reset();let mix=t.buildQueue('mixed',12);check(new Set(mix.map(q=>q.skill)).size===7,'混合覆盖七维');check(new Set(mix.map(q=>q.id)).size===12,'混合不重复');check(t.buildQueue('verbs',12,'U1','dictation').length===0,'无匹配筛选返回空');
check(t.norm("You've")!==t.norm('You have'),'不盲目接受未支持表达');check(t.norm("We don’t need to leave now!")===t.norm('We do not need to leave now.'),'缩写和标点规范化');check(!t.validState({version:1,history:[null]}),'损坏备份被拒绝');check(t.validState(t.state),'自身档案可再次导入');
const bear=D.verbs.find(v=>v.base==='bear');check(bear.pp==='borne','bear 忍受校正');check(!Q.some(q=>q.prompt.includes('can（')&&q.prompt.includes('过去分词')),'情态动词不生成分词默写');

const dialogue=Q.filter(q=>q.skill==='dialogue');
check(Q.length===839&&dialogue.length===42,'保留797题并新增42题');
for(const u of ['U1','U2','unit3'])check(dialogue.filter(q=>q.unit===u).length===14,'每单元14题');
for(const c of ctx.window.DIALOGUE_CONTENT.cases){const qs=dialogue.filter(q=>q.caseId===c.id);check(qs.length===5&&new Set(qs.map(q=>q.blank)).size===5,'每组五空齐全');}
const dq=dialogue.find(q=>q.type==='dialogue');t.reset();answer(dq,undefined,false,false);check(t.state.mistakes[dq.id]&&t.metric('dialogue').score===0,'答案对但关联错不能视为掌握');
t.reset();for(const q of dialogue.filter(q=>q.type==='fill'))for(const a of q.answer)answer(q,a);check(t.metric('dialogue').score===100,'语法填空不要求不存在的证据步骤');
t.action('start',{dataset:{skill:'dialogue',count:'12',type:'fill'}});check(t.session.queue.length===12&&t.session.queue.every(q=>q.type==='fill'),'语法按钮只启动填空题');
t.action('dialogue-case',{dataset:{case:'photo'}});check(t.session.queue.map(q=>q.blank).join(',')==='1,2,3,4,5','真题按五空顺序练习');
const raw=fs.existsSync(__dirname+'/sources/29.txt')?fs.readFileSync(__dirname+'/sources/29.txt','utf8'):null;
for(const q of dialogue.filter(q=>q.caseId==='photo'))check(q.originalExplain&&(!raw||raw.includes(q.originalExplain)),'真题原解析完整保留');
check(node('#app').innerHTML.includes('target-blank'),'当前空位突出显示');

console.log(JSON.stringify({checks,questions:Q.length,answerPositionDistribution:dist,result:'PASS'},null,2));
