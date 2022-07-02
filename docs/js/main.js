window.addEventListener('DOMContentLoaded', async(event) => {
    try {
        window.mpurse.updateEmitter.removeAllListeners()
          .on('stateChanged', async(isUnlocked) => { /*await init();*/ console.log(isUnlocked); })
          .on('addressChanged', async(address) => { /*await init(address);*/ console.log(address); });
    } catch(e) { console.debug(e) }
    document.addEventListener('mastodon_redirect_rejected', async(event) => {
        console.debug('認証エラーです。認証を拒否しました。')
        console.debug(event.detail.error)
        console.debug(event.detail.error_description)
        Toaster.toast('キャンセルしました')
    });
    document.addEventListener('misskey_redirect_approved', async(event) => {
        console.debug('===== misskey_redirect_approved =====')
        console.debug(event.detail)
        // actionを指定したときの入力と出力を表示する
        for (let i=0; i<event.detail.actions.length; i++) {
            console.debug(event.detail.actions[i], (event.detail.params) ? event.detail.params[i] : null, event.detail.results[i])
            console.debug(`----- ${event.detail.actions[i]} -----`)
            console.debug((event.detail.params) ? event.detail.params[i] : null)
            console.debug(event.detail.results[i])
        }
        // 認証リダイレクトで許可されたあとアクセストークンを生成して作成したclientを使ってAPIを発行する
        //const res = event.detail.client.toot(JSON.parse(event.detail.params[0]))
        // 独自処理
        for (let i=0; i<event.detail.actions.length; i++) {
            if ('note' == event.detail.actions[i]) {
                const html = new Comment().misskeyResToComment(event.detail.results[i].createdNote, event.detail.domain)
                const comment = document.querySelector(`mention-section`).shadowRoot.querySelector(`#web-mention-comment`)
                comment.innerHTML = html + comment.innerHTML
            }
        }
    });
    document.addEventListener('misskey_redirect_rejected', async(event) => {
        console.debug('認証エラーです。認証を拒否しました。')
        console.debug(event.detail.error)
        console.debug(event.detail.error_description)
        Toaster.toast('キャンセルしました')
    });
    // リダイレクト認証後
    const reciverMastodon = new MastodonRedirectCallbackReciver()
    await reciverMastodon.recive()
    const reciverMisskey = new MisskeyRedirectCallbackReciver()
    await reciverMisskey.recive()

    /*
    const downloader = new FaviconDownloader()
    document.getElementById('download').addEventListener('click', async(event) => {
        const hostNames = new Set(document.getElementById('urls').value.split(/\r\n|\n/).filter(v=>v.startsWith('https')).map(l=>new URL(l).hostname))
        console.debug(hostNames)
        console.debug(hostNames.values())
        console.debug(Array.from(hostNames))
        //const files = await Promise.all(hostNames.values().map(h=>FaviconGetter.get(h)))
        const _files = await Promise.all(Array.from(hostNames).map(h=>FaviconGetter.get(h)))
        console.debug(_files)
        const files = _files.filter(v=>v)
        console.debug(files)
        if (0 < files.length) { await downloader.download(files) }
        else { Toaster.toast('<link rel="icon">をもつURL先がひとつもありません。', true) }
    })
    */
    Loading.setup()
    /*
    PartySparkleHart.setup()
    PartySparkleImage.setup()
    //await gen.generate()
    document.getElementById('get-address').dispatchEvent(new Event('click'))
    imgSz.show();
    //Loading.hide()
    */
    const uploader = new Sqlite3DbUploader()
    uploader.setup() 
    const downloader = new Sqlite3DbDownloader()
    document.getElementById('download').addEventListener('click', async(event) => {
        downloader.download() 
    })
    /*
    initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    }).then(SQL => {
        const db = new SQL.Database();
        let res = JSON.stringify(db.exec("SELECT sqlite_version();"));
        console.debug(res)
        res = JSON.stringify(db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);`));
        console.debug(res)
        res = JSON.stringify(db.exec(`INSERT INTO users(name) VALUES ('ytyaru');`));
        console.debug(res)
        res = JSON.stringify(db.exec(`SELECT * FROM users;`));
        console.debug(res)
        //db.export()
        const downloader = new Sqlite3DbDownloader()
        downloader.download() 
    });
    */
});
window.addEventListener('load', async(event) => {
    //Loading.hide()
})
