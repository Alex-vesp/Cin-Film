let app = require('express')()

app.get('/', (req, res) =>{
    res.send('root')
})

console.log('test')


app.listen(8080)