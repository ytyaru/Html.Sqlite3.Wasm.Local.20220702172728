class Sqlite3Loader {
    constructor() {
        this.sql = null
        this.version = '1.6.2'
        //this.version = '1.7.0' // Uncaught (in promise) TypeError: Cannot read property 'apply' of undefined
    }
    //get SQL() { return this.sql } // async にできない！
    async load() {
        if (!this.sql) {
            // file: sql-wasm.wasm
            //this.sql = await initSqlJs({locateFile: file => console.debug(file)})
            this.sql = await initSqlJs({locateFile: file => `lib/sql.js/${this.version}/${file}`})
            //this.SQL = await initSqlJs({locateFile: file => `lib/sql.js/1.6.2/${file}`})
            //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
        }
        return this.sql
    }
}
Sqlite3Loader = new Sqlite3Loader()
