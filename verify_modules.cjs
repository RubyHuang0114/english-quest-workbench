const fs=require('fs'),vm=require('vm'),assert=require('assert');let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++};
let storage={};
function load(){const c={window:{},console,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v}};vm.createContext(c);for(const f of ['data.js','modules/catalog.js','content.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);return c.window}
let w=load(),api=w.CONTENT_API,p=JSON.parse(fs.readFileSync(__dirname+'/modules/unit-template.json','utf8'));
check(w.REVIEW_DATA.questions.length===669,'默认主线不含示例包');check(!w.REVIEW_DATA.questions.some(q=>q.unit==='U3'),'没有自动启用U3');check(api.validate(p).questions.length===1,'模板格式有效');
api.install(p);w=load();api=w.CONTENT_API;check(w.REVIEW_DATA.questions.length===670,'重载后新增题目');check(w.REVIEW_DATA.questions.some(q=>q.id==='u3-draft:example-01'),'命名空间正确');check(w.REVIEW_DATA.lessons.some(l=>l.id==='U3'),'扩展知识入口存在');check(api.loadedPacks.length===1,'已启用列表正确');
assert.throws(()=>api.install(p));checks++;
for(const update of [{schemaVersion:9},{id:'bad id'},{questions:[]},{questions:[{...p.questions[0],answer:10}]},{questions:[{...p.questions[0],options:['x','x']}]},{questions:[{...p.questions[0],skill:'unknown'}]},{questions:[{...p.questions[0],type:'reading'}]}]){assert.throws(()=>api.validate({...p,...update}));checks++}
check(api.getQuestionIds([p])[0]==='u3-draft:example-01','备份题目ID校验一致');api.replace([]);w=load();check(w.REVIEW_DATA.questions.length===669,'题包替换恢复默认范围');
console.log(JSON.stringify({checks,result:'PASS'},null,2));
