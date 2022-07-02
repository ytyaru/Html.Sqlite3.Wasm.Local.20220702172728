class Sqlite3DbUploader {
    constructor() {
        this.SQL = null
    }
    setup() {
        const self = this
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const preview = document.getElementById('preview');
        dropZone.addEventListener('dragover', (e)=>{
            console.debug('dragover')
            e.stopPropagation()
            e.preventDefault()
            e.target.style.background = '#e1e7f0'
        }, false)
        dropZone.addEventListener('dragleave', (e)=>{
            console.debug('dragleave')
            e.stopPropagation()
            e.preventDefault()
            e.target.style.background = '#ffffff'
        }, false)
        fileInput.addEventListener('change', ()=>{
            previewFile(this.files[0])
        })
        dropZone.addEventListener('drop', async(e)=>{
            Loading.show()
            console.debug('drop')
            e.stopPropagation()
            e.preventDefault()
            e.target.style.background = '#ffffff'
            var files = e.dataTransfer.files
            if (files.length > 1) { return Toaster.toast('アップロードできるファイルは1つだけです。', true); }
            fileInput.files = files
            const fr = new FileReader()
            fr.readAsArrayBuffer(files[0])
            fr.onload = async()=>{ await this.#preview(new Uint8Array(fr.result)) }
        }, false)
    }
    async #preview(content) {
        this.SQL = await Sqlite3Loader.load()
        console.debug(content)
        const db = new this.SQL.Database(content);
        let res = JSON.stringify(db.exec(`SELECT sqlite_version();`))
        console.debug(res)
        const t = db.exec(`select name from sqlite_master;`)
        console.debug(t)
        const tableNames = db.exec(`select name from sqlite_master;`).map(t=>t.values[0])
        console.debug(tableNames)
        res = db.exec(`select * from users;`)
        console.debug(res)
        const tables = new Map()
        const preview = document.getElementById(`preview`)
        const html = []
        for (const name of tableNames) {
            console.debug(name)
            const sql = db.exec(`select sql from sqlite_master where type='table' and name='${name}';`)
            console.debug(sql)
            const columns = db.exec(`PRAGMA table_info(${name})`)
            console.debug(columns)
            const records = db.exec(`select * from ${name};`)
            console.debug(records)
            const data = { name:name, sql:sql[0], columns:columns[0], rows:records[0] }
            tables.set(name, data)
            html.push(this.#makeTable(data))
        }
        console.debug(html.join(''))
        preview.innerHTML = html.join('')
        console.debug(tables)
        Loading.hide()
    }
    #makeTable(data) {
        const th = data.columns.values.map(v=>`<th>${v[1]}</th>`).join('')
        const td = []
        for (const row of data.rows.values) {
            td.push('<tr>' + row.map(d=>`<td>${d}</td>`).join('') + '</tr>')
        }
        return `<table><caption>${data.name}</caption>
<tr>${th}</tr>
${td.join('')}
</table>`
    }
    async download(name='users', ext='db') {
        Loading.show()
        this.zip = new JSZip()
        const content = await this.#makeDb()
        this.zip.file(`${name}.${ext}`, content)
        //await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `${name}.zip`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`ZIPファイルをダウンロードしました！`)
    }
    #getOs() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows nt") !== -1) { return 'DOS' }
        return 'UNIX'
    }
    async #makeDb() {
        this.SQL = await Sqlite3Loader.load()
        const db = new this.SQL.Database();
        let res = JSON.stringify(db.exec("SELECT sqlite_version();"));
        console.debug(res)
        res = JSON.stringify(db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);`));
        console.debug(res)
        //res = JSON.stringify(db.exec(`.tables`)); // .コマンドは使えなかった
        //console.debug(res)
        const values = document.getElementById('usernames').value.split('\n').filter(v=>v).map(n=>`('${n}')`).join(',')
        res = JSON.stringify(db.exec(`INSERT INTO users(name) VALUES ${values || "('ytyaru')"};`));
        console.debug(res)
        res = JSON.stringify(db.exec(`SELECT * FROM users;`));
        console.debug(res)
        return db.export()
    }
}
