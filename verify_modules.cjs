const fs=require('fs'),vm=require('vm'),assert=require('assert');let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++};
let storage={};
function load(){const c={window:{},console,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v}};vm.createContext(c);for(const f of ['data.js','modules/catalog.js','content.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);return c.window}
let w=load(),api=w.CONTENT_API,p=JSON.parse(fs.readFileSync(__dirname+'/modules/unit-template.json','utf8'));
check(w.REVIEW_DATA.questions.length===797,'默认主线含正式unit3但不含示例包');check(w.REVIEW_DATA.questions.filter(q=>q.unit==='unit3').length===128,'正式unit3题数正确');check(api.validate(p).questions.length===1,'模板格式有效');
api.install(p);w=load();api=w.CONTENT_API;check(w.REVIEW_DATA.questions.length===798,'重载后新增题目');check(w.REVIEW_DATA.questions.some(q=>q.id==='u3-draft:example-01'),'命名空间正确');check(w.REVIEW_DATA.lessons.some(l=>l.id==='U3'),'扩展知识入口存在');check(api.loadedPacks.length===2,'已启用列表正确');
assert.throws(()=>api.install(p));checks++;
for(const update of [{schemaVersion:9},{id:'bad id'},{questions:[]},{questions:[{...p.questions[0],answer:10}]},{questions:[{...p.questions[0],options:['x','x']}]},{questions:[{...p.questions[0],skill:'unknown'}]},{questions:[{...p.questions[0],type:'reading'}]}]){assert.throws(()=>api.validate({...p,...update}));checks++}
check(api.getQuestionIds([p])[0]==='u3-draft:example-01','备份题目ID校验一致');api.replace([]);w=load();check(w.REVIEW_DATA.questions.length===797,'题包替换恢复默认范围');
check(w.REVIEW_DATA.vocab.filter(v=>v.unit==='unit3').length===24,'unit3词汇卡完整');check(w.REVIEW_DATA.lessons.find(l=>l.id==='unit3').points.length===10,'unit3知识清单完整');for(const q of w.REVIEW_DATA.questions.filter(q=>q.unit==='unit3'&&q.parentId))check(w.REVIEW_DATA.questions.some(r=>r.id===q.parentId&&r.type==='reading'),'阅读配套ID完整');assert.throws(()=>api.validate({...p,points:'bad'}));checks++;assert.throws(()=>api.validate({...p,vocab:[{word:'x'}]}));checks++;assert.throws(()=>api.validate({...p,questions:[{...p.questions[0],parentId:'missing'}]}));checks++;
console.log(JSON.stringify({checks,result:'PASS'},null,2));
