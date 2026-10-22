import{L as e,T as t,Y as n,_ as r,b as i,g as a,gt as o,mt as s,x as c}from"./modules/shiki-mPS_OL6C.js";import{nt as l,rt as u}from"./index-BbZ-Zv1J.js";import{t as d}from"./slidev/default-DElRNtnH.js";import{t as f}from"./slidev/CodeBlockWrapper-DNfEEO1y.js";var p={__name:`slide_total.md__slidev_76`,setup(p){let{$slidev:m,$nav:h,$clicksContext:g,$clicks:_,$page:v,$renderContext:y,$frontmatter:b}=u();return g.setup(),(u,p)=>{let m=f;return e(),r(d,o(t(s(l)(s(b),75))),{default:n(()=>[p[1]||=a(`h2`,null,`工具，送出去長什麼樣子？`,-1),p[2]||=a(`p`,null,[i(`AI 沒有手。所謂「給它工具」，就是在 `),a(`strong`,null,`System`),i(` 裡寫一份`),a(`strong`,null,`按鈕說明書`),i(`：`)],-1),c(m,{title:``,ranges:[]},{default:n(()=>[...p[0]||=[a(`pre`,{class:`shiki shiki-themes vitesse-dark vitesse-light slidev-code`,style:{"--shiki-dark":`#dbd7caee`,"--shiki-light":`#393a34`,"--shiki-dark-bg":`#121212`,"--shiki-light-bg":`#ffffff`}},[a(`code`,{class:`language-text`},[a(`span`,{class:`line`},[a(`span`,null,`[System]`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`你是一位工程師，在一個 Python 專案資料夾裡工作，請用繁體中文。`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`每一輪只能回覆一個 JSON，不要有其他文字。你能用的工具：`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`- {"tool": "list_files"}　列出專案裡的所有檔案`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`- {"tool": "read_file", "path": "檔名"}　讀一個檔案`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`- {"tool": "write_file", "path": "檔名", "content": "完整內容"}　整個檔案覆寫`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`- {"tool": "run_tests"}　在沙箱裡跑講師的驗收測試，回傳結果重點`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`- {"tool": "done", "summary": "你做了什麼"}　完成任務`)]),i(`
`),a(`span`,{class:`line`},[a(`span`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`[Human]`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`客人抱怨：金卡會員買 199 元的商品，結帳畫面顯示 159.20000000000002 元。`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`請修好 shop/discount.py，計算規則請照 README.md。`)]),i(`
`),a(`span`,{class:`line`},[a(`span`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`[AI]`)]),i(`
`),a(`span`,{class:`line`},[a(`span`,null,`{"tool": "list_files"}`)])])],-1)]]),_:1}),p[3]||=a(`p`,null,[i(`AI 只是`),a(`strong`,null,`回一段文字說它想按哪個按鈕`),i(`；真正去讀檔的，是外面的程式（harness）。`)],-1),p[4]||=a(`p`,null,[a(`span`,null,`來源：04-harness/demo/runs/ex1_ladder/L2_能跑測試-1/log.txt`)],-1)]),_:1},16)}}};export{p as default};