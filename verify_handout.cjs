const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={window:{},console,localStorage:{getItem(){return null},setItem(){}}};vm.createContext(c);
for(const f of ['data.js','modules/catalog.js','modules/unit3-handout.js','content.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);
const p=c.window.REVIEW_MODULES.find(x=>x.id==='unit3-handout-7pages'),d=c.window.REVIEW_DATA,h=c.window.U3_HANDOUT;
let checks=0;const ok=(x,m)=>{assert(x,m);checks++};
ok(p&&c.window.CONTENT_API.validate(p),'新增讲义包符合后续单元接口');
ok(h.sections.map(s=>s.id).join('')==='ABCDE'&&h.families.length===26,'A—E和26组词性转换完整');
ok(h.sections.reduce((n,s)=>n+s.words.length,0)>=50,'A—E词汇逐项录入');
ok(h.sections.every(s=>s.page>=3&&s.page<=7),'板块页码准确');
ok(h.sections.find(s=>s.id==='C').sentences.some(x=>x[0].includes('dabbawalas')),'午餐配送阅读语境保留');
ok(h.sections.find(s=>s.id==='E').sentences.some(x=>x[0].includes('teacher')),'写作句型保留');
ok(p.questions.every(q=>q.locator.includes('7AU3 Jobs 讲义第')&&q.unit===undefined),'新增题目可逐题追溯讲义页码');
ok(p.questions.length===d.questions.filter(q=>q.source==='module:unit3-handout-7pages').length,'讲义练习全部加载');
ok(p.vocab.every(v=>v.sentence.includes('___')),'新增词卡含可用于练习的填空句');
ok(new Set(d.vocab.map(v=>v.unit+':'+v.word.toLowerCase())).size===d.vocab.length,'不重复已有Unit3词卡');
for(const q of p.questions){ok(q.explain&&q.answer!==undefined,'解析与答案齐全：'+q.id);if(q.options)ok(q.options[q.answer]&&new Set(q.options).size===q.options.length,'选项与答案有效：'+q.id);else ok(q.answer.every(a=>a),'填答答案有效：'+q.id)}
ok(d.lessons.some(l=>l.title.includes('新增7页知识点')&&l.points.length===14),'知识清单接入');
console.log(JSON.stringify({result:'PASS',checks,questions:p.questions.length,newVocab:p.vocab.length,phrases:h.sections.reduce((n,s)=>n+s.phrases.length,0)}));
